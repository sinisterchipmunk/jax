class Jax.Mesh.PLY.Parser
  BIG_ENDIAN = 1
  LITTLE_ENDIAN = 2
  
  sizeOf: (type) ->
    switch type
      when 'char'  then Int8Array.BYTES_PER_ELEMENT
      when 'uchar' then Uint8Array.BYTES_PER_ELEMENT
      when 'short' then Int16Array.BYTES_PER_ELEMENT
      when 'ushort' then Uint16Array.BYTES_PER_ELEMENT
      when 'int'    then Int32Array.BYTES_PER_ELEMENT
      when 'uint'   then Uint32Array.BYTES_PER_ELEMENT
      when 'float'  then Float32Array.BYTES_PER_ELEMENT
      when 'double' then Float64Array.BYTES_PER_ELEMENT
      else throw new Error "Unexpected data type: #{type}"
      
  readType: (bufferView, type, endianness, byteOffset = 0) ->
    switch type
      when 'char'   then bufferView.getInt8    byteOffset
      when 'uchar'  then bufferView.getUint8   byteOffset
      when 'short'  then bufferView.getInt16   byteOffset, endianness == LITTLE_ENDIAN
      when 'ushort' then bufferView.getUint16  byteOffset, endianness == LITTLE_ENDIAN
      when 'int'    then bufferView.getInt32   byteOffset, endianness == LITTLE_ENDIAN
      when 'uint'   then bufferView.getUint32  byteOffset, endianness == LITTLE_ENDIAN
      when 'float'  then bufferView.getFloat32 byteOffset, endianness == LITTLE_ENDIAN
      when 'double' then bufferView.getFloat64 byteOffset, endianness == LITTLE_ENDIAN
      else throw new Error "Unexpected data type: #{type}"
      
  stringToBytes: (str) ->
    result = []
    for i in [0...str.length]
      _char = str.charCodeAt i
      stack = []
      stack.unshift _char & 0xff
      _char = _char >> 8
      while _char
        stack.unshift _char & 0xff
        _char = _char >> 8
      result = result.concat stack
    result
    
  bytesToString: (arr, beginOffset = 0) ->
    result = ""
    for i in [beginOffset...arr.length]
      result += String.fromCharCode(arr[i])
    result
  
  constructor: (content) ->
    @comments = []
    if typeof content is 'string' then bytes = new Uint8Array @stringToBytes content
    else bytes = new Uint8Array content
    
    header = @parseHeader bytes
    elements = @processHeader header
    bytes = new Uint8Array bytes.buffer, header.length
    
    switch @format
      when 'ascii' then @processASCII elements, @bytesToString(bytes).split(/\n/)
      when 'binary_big_endian' then @processBinary elements, bytes, BIG_ENDIAN
      when 'binary_little_endian' then @processBinary elements, bytes, LITTLE_ENDIAN
      else throw new Error "format #{@format} (#{@version}) is not supported"
      
  parseHeader: (bytes) ->
    header = ""
    for _byte in bytes
      header += String.fromCharCode _byte
      break if header.indexOf('end_header\n') != -1
    header
    
  processHeader: (header) ->
    header = header.trim().split(/\n/)
    throw new Error "Not a PLY!" unless header.shift() is 'ply'
    throw new Error "Could not detect end of header!" unless header.pop() is 'end_header'
    
    elements = []
    while header.length > 0
      line = header.shift()
      tokens = line.split /\s+/
      switch tokens[0]
        when 'format' then [@format, @version] = [tokens[1], tokens[2]]
        when 'comment' then @comments.push tokens[1..-1].join(' ')
        when 'element'
          elements.push element =
            name: tokens[1]
            count: parseInt tokens[2]
            properties: []
        when 'property'
          element.properties.push tokens[1..-1]
      break if line is 'end_header'
    elements
      
  arrayBuffers = {}
  arrayViews = {}
  readBinaryValue: (bytes, type, endianness, offset = 0) ->
    byteSize = @sizeOf type
    arrayBuffers[byteSize] or= new ArrayBuffer byteSize
    arrayViews[byteSize] or= new DataView arrayBuffers[byteSize]
    for ofs in [0...byteSize]
      arrayViews[byteSize].setUint8 ofs, bytes[offset+ofs]
    @readType arrayViews[byteSize], type

  processBinary: (elements, bytes, endianness) ->
    offset = 0
    for element in elements
      this[element.name] = new Array element.count
      for i in [0...element.count]
        this[element.name][i] = descriptor = {}
        for property in element.properties
          if property[0] is 'list'
            listLength = @readBinaryValue bytes, property[1], endianness, offset
            offset += @sizeOf property[1]
            elementType = property[2]
            elementSize = @sizeOf elementType
            descriptor[property[3]] = new Array(listLength)
            for j in [0...listLength]
              descriptor[property[3]][j] = @readBinaryValue bytes, elementType, endianness, offset
              offset += elementSize
          else
            value = @readBinaryValue bytes, property[0], endianness, offset
            offset += @sizeOf property[0]
            descriptor[property[1]] = value
    offset
            
  processASCII: (elements, lines) ->
    for element in elements
      this[element.name] = new Array element.count
      for i in [0...element.count]
        tokens = lines.shift().split /\s+/
        this[element.name][i] = descriptor = {}
        for property in element.properties
          switch property[0]
            when 'float' then descriptor[property[1]] = parseFloat tokens.shift()
            when 'list' # uchar int vertex_index
              listLengthType = property[1]
              listElementType = property[2]
              listLength = parseInt tokens.shift()
              descriptor[property[3]] = (parseInt tokens.shift() for e in [0...listLength])
            else throw new Error "Unrecognized property: #{JSON.stringify property}"
    true
    