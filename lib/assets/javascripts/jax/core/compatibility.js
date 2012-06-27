/* Defines constants, functions, etc. that may exist in one browser but not in another */

/* KeyEvent in Firefox contains various keyCode constants, but they are missing in Chrome. */
if (typeof(KeyEvent) == "undefined") {
  /**
   * Global.KeyEvent
   *
   * By default, Firefox defines a global +KeyEvent+ namespace containing character codes
   * for use with keyboard events. These are very useful for comparison with +event.keyCode+,
   * but are not supported by other browsers.
   *
   * In the event that a browser other than Firefox is used, Jax defines a fake +KeyEvent+
   * namespace to be used in its place. The constants contained within are taken from
   * Firefox 3.6, with the addition of the boolean +fake+, which is always true unless
   * the client is using Firefox.
   *
   * The individual values of the following constants may be different from one client to another:
   *
   *     KeyEvent.DOM_VK_CANCEL
   *     KeyEvent.DOM_VK_HELP
   *     KeyEvent.DOM_VK_BACK_SPACE
   *     KeyEvent.DOM_VK_TAB
   *     KeyEvent.DOM_VK_CLEAR
   *     KeyEvent.DOM_VK_RETURN
   *     KeyEvent.DOM_VK_ENTER
   *     KeyEvent.DOM_VK_SHIFT
   *     KeyEvent.DOM_VK_CONTROL
   *     KeyEvent.DOM_VK_ALT
   *     KeyEvent.DOM_VK_PAUSE
   *     KeyEvent.DOM_VK_CAPS_LOCK
   *     KeyEvent.DOM_VK_ESCAPE
   *     KeyEvent.DOM_VK_SPACE
   *     KeyEvent.DOM_VK_PAGE_UP
   *     KeyEvent.DOM_VK_PAGE_DOWN
   *     KeyEvent.DOM_VK_END
   *     KeyEvent.DOM_VK_HOME
   *     KeyEvent.DOM_VK_LEFT
   *     KeyEvent.DOM_VK_UP
   *     KeyEvent.DOM_VK_RIGHT
   *     KeyEvent.DOM_VK_DOWN
   *     KeyEvent.DOM_VK_PRINTSCREEN
   *     KeyEvent.DOM_VK_INSERT
   *     KeyEvent.DOM_VK_DELETE
   *     KeyEvent.DOM_VK_0
   *     KeyEvent.DOM_VK_1
   *     KeyEvent.DOM_VK_2
   *     KeyEvent.DOM_VK_3
   *     KeyEvent.DOM_VK_4
   *     KeyEvent.DOM_VK_5
   *     KeyEvent.DOM_VK_6
   *     KeyEvent.DOM_VK_7
   *     KeyEvent.DOM_VK_8
   *     KeyEvent.DOM_VK_9
   *     KeyEvent.DOM_VK_SEMICOLON
   *     KeyEvent.DOM_VK_EQUALS
   *     KeyEvent.DOM_VK_A
   *     KeyEvent.DOM_VK_B
   *     KeyEvent.DOM_VK_C
   *     KeyEvent.DOM_VK_D
   *     KeyEvent.DOM_VK_E
   *     KeyEvent.DOM_VK_F
   *     KeyEvent.DOM_VK_G
   *     KeyEvent.DOM_VK_H
   *     KeyEvent.DOM_VK_I
   *     KeyEvent.DOM_VK_J
   *     KeyEvent.DOM_VK_K
   *     KeyEvent.DOM_VK_L
   *     KeyEvent.DOM_VK_M
   *     KeyEvent.DOM_VK_N
   *     KeyEvent.DOM_VK_O
   *     KeyEvent.DOM_VK_P
   *     KeyEvent.DOM_VK_Q
   *     KeyEvent.DOM_VK_R
   *     KeyEvent.DOM_VK_S
   *     KeyEvent.DOM_VK_T
   *     KeyEvent.DOM_VK_U
   *     KeyEvent.DOM_VK_V
   *     KeyEvent.DOM_VK_W
   *     KeyEvent.DOM_VK_X
   *     KeyEvent.DOM_VK_Y
   *     KeyEvent.DOM_VK_Z
   *     KeyEvent.DOM_VK_CONTEXT_MENU
   *     KeyEvent.DOM_VK_NUMPAD0
   *     KeyEvent.DOM_VK_NUMPAD1
   *     KeyEvent.DOM_VK_NUMPAD2
   *     KeyEvent.DOM_VK_NUMPAD3
   *     KeyEvent.DOM_VK_NUMPAD4
   *     KeyEvent.DOM_VK_NUMPAD5
   *     KeyEvent.DOM_VK_NUMPAD6
   *     KeyEvent.DOM_VK_NUMPAD7
   *     KeyEvent.DOM_VK_NUMPAD8
   *     KeyEvent.DOM_VK_NUMPAD9
   *     KeyEvent.DOM_VK_MULTIPLY
   *     KeyEvent.DOM_VK_ADD
   *     KeyEvent.DOM_VK_SEPARATOR
   *     KeyEvent.DOM_VK_SUBTRACT
   *     KeyEvent.DOM_VK_DECIMAL
   *     KeyEvent.DOM_VK_DIVIDE
   *     KeyEvent.DOM_VK_F1
   *     KeyEvent.DOM_VK_F2
   *     KeyEvent.DOM_VK_F3
   *     KeyEvent.DOM_VK_F4
   *     KeyEvent.DOM_VK_F5
   *     KeyEvent.DOM_VK_F6
   *     KeyEvent.DOM_VK_F7
   *     KeyEvent.DOM_VK_F8
   *     KeyEvent.DOM_VK_F9
   *     KeyEvent.DOM_VK_F10
   *     KeyEvent.DOM_VK_F11
   *     KeyEvent.DOM_VK_F12
   *     KeyEvent.DOM_VK_F13
   *     KeyEvent.DOM_VK_F14
   *     KeyEvent.DOM_VK_F15
   *     KeyEvent.DOM_VK_F16
   *     KeyEvent.DOM_VK_F17
   *     KeyEvent.DOM_VK_F18
   *     KeyEvent.DOM_VK_F19
   *     KeyEvent.DOM_VK_F20
   *     KeyEvent.DOM_VK_F21
   *     KeyEvent.DOM_VK_F22
   *     KeyEvent.DOM_VK_F23
   *     KeyEvent.DOM_VK_F24
   *     KeyEvent.DOM_VK_NUM_LOCK
   *     KeyEvent.DOM_VK_SCROLL_LOCK
   *     KeyEvent.DOM_VK_COMMA
   *     KeyEvent.DOM_VK_PERIOD
   *     KeyEvent.DOM_VK_SLASH
   *     KeyEvent.DOM_VK_BACK_QUOTE
   *     KeyEvent.DOM_VK_OPEN_BRACKET
   *     KeyEvent.DOM_VK_BACK_SLASH
   *     KeyEvent.DOM_VK_CLOSE_BRACKET
   *     KeyEvent.DOM_VK_QUOTE
   *     KeyEvent.DOM_VK_META
   *
   **/
  KeyEvent = {
    fake: true,
    DOM_VK_CANCEL : 3,
    DOM_VK_HELP : 6,
    DOM_VK_BACK_SPACE : 8,
    DOM_VK_TAB : 9,
    DOM_VK_CLEAR : 12,
    DOM_VK_RETURN : 13,
    DOM_VK_ENTER : 14,
    DOM_VK_SHIFT : 16,
    DOM_VK_CONTROL : 17,
    DOM_VK_ALT : 18,
    DOM_VK_PAUSE : 19,
    DOM_VK_CAPS_LOCK : 20,
    DOM_VK_ESCAPE : 27,
    DOM_VK_SPACE : 32,
    DOM_VK_PAGE_UP : 33,
    DOM_VK_PAGE_DOWN : 34,
    DOM_VK_END : 35,
    DOM_VK_HOME : 36,
    DOM_VK_LEFT : 37,
    DOM_VK_UP : 38,
    DOM_VK_RIGHT : 39,
    DOM_VK_DOWN : 40,
    DOM_VK_PRINTSCREEN : 44,
    DOM_VK_INSERT : 45,
    DOM_VK_DELETE : 46,
    DOM_VK_0 : 48,
    DOM_VK_1 : 49,
    DOM_VK_2 : 50,
    DOM_VK_3 : 51,
    DOM_VK_4 : 52,
    DOM_VK_5 : 53,
    DOM_VK_6 : 54,
    DOM_VK_7 : 55,
    DOM_VK_8 : 56,
    DOM_VK_9 : 57,
    DOM_VK_SEMICOLON : 59,
    DOM_VK_EQUALS : 61,
    DOM_VK_A : 65,
    DOM_VK_B : 66,
    DOM_VK_C : 67,
    DOM_VK_D : 68,
    DOM_VK_E : 69,
    DOM_VK_F : 70,
    DOM_VK_G : 71,
    DOM_VK_H : 72,
    DOM_VK_I : 73,
    DOM_VK_J : 74,
    DOM_VK_K : 75,
    DOM_VK_L : 76,
    DOM_VK_M : 77,
    DOM_VK_N : 78,
    DOM_VK_O : 79,
    DOM_VK_P : 80,
    DOM_VK_Q : 81,
    DOM_VK_R : 82,
    DOM_VK_S : 83,
    DOM_VK_T : 84,
    DOM_VK_U : 85,
    DOM_VK_V : 86,
    DOM_VK_W : 87,
    DOM_VK_X : 88,
    DOM_VK_Y : 89,
    DOM_VK_Z : 90,
    DOM_VK_CONTEXT_MENU : 93,
    DOM_VK_NUMPAD0 : 96,
    DOM_VK_NUMPAD1 : 97,
    DOM_VK_NUMPAD2 : 98,
    DOM_VK_NUMPAD3 : 99,
    DOM_VK_NUMPAD4 : 100,
    DOM_VK_NUMPAD5 : 101,
    DOM_VK_NUMPAD6 : 102,
    DOM_VK_NUMPAD7 : 103,
    DOM_VK_NUMPAD8 : 104,
    DOM_VK_NUMPAD9 : 105,
    DOM_VK_MULTIPLY : 106,
    DOM_VK_ADD : 107,
    DOM_VK_SEPARATOR : 108,
    DOM_VK_SUBTRACT : 109,
    DOM_VK_DECIMAL : 110,
    DOM_VK_DIVIDE : 111,
    DOM_VK_F1 : 112,
    DOM_VK_F2 : 113,
    DOM_VK_F3 : 114,
    DOM_VK_F4 : 115,
    DOM_VK_F5 : 116,
    DOM_VK_F6 : 117,
    DOM_VK_F7 : 118,
    DOM_VK_F8 : 119,
    DOM_VK_F9 : 120,
    DOM_VK_F10 : 121,
    DOM_VK_F11 : 122,
    DOM_VK_F12 : 123,
    DOM_VK_F13 : 124,
    DOM_VK_F14 : 125,
    DOM_VK_F15 : 126,
    DOM_VK_F16 : 127,
    DOM_VK_F17 : 128,
    DOM_VK_F18 : 129,
    DOM_VK_F19 : 130,
    DOM_VK_F20 : 131,
    DOM_VK_F21 : 132,
    DOM_VK_F22 : 133,
    DOM_VK_F23 : 134,
    DOM_VK_F24 : 135,
    DOM_VK_NUM_LOCK : 144,
    DOM_VK_SCROLL_LOCK : 145,
    DOM_VK_COMMA : 188,
    DOM_VK_PERIOD : 190,
    DOM_VK_SLASH : 191,
    DOM_VK_BACK_QUOTE : 192,
    DOM_VK_OPEN_BRACKET : 219,
    DOM_VK_BACK_SLASH : 220,
    DOM_VK_CLOSE_BRACKET : 221,
    DOM_VK_QUOTE : 222,
    DOM_VK_META: 224
  };
  
  /* TODO handle special cases -- see http://www.javascripter.net/faq/keycodes.htm */
}
