### HyperEVM oracle for HyperLend

---

If asset is available as perp on Hyperliquid, we just use the perp oracle price (submited by L1 validators).

Otherwise, keepers must submit data ever round

- round frequency: 60 seconds or when price moves by X%

