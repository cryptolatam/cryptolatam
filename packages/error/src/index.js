"use strict";

import ExtendableError from "es6-error";

export default class CryptoLATAMError extends ExtendableError {
  constructor(message = "Unspecified Error", data = null) {
    super(message);
    this.data = data;
    this.isCryptoLATAMError = true;
  }
}
