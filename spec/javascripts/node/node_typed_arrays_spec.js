describe("Typed arrays", function() {
  it("sizes", function() {
    expect(Int8Array.BYTES_PER_ELEMENT).toEqual(1);
    expect(Uint8Array.BYTES_PER_ELEMENT).toEqual(1);
    expect(Int16Array.BYTES_PER_ELEMENT).toEqual(2);
    expect(Uint16Array.BYTES_PER_ELEMENT).toEqual(2);
    expect(Int32Array.BYTES_PER_ELEMENT).toEqual(4);
    expect(Uint32Array.BYTES_PER_ELEMENT).toEqual(4);
    expect(Float32Array.BYTES_PER_ELEMENT).toEqual(4);
    expect(Float64Array.BYTES_PER_ELEMENT).toEqual(8);
  });
  
  
});