const express = require("express");
const server = require("./api/server.js");

const PORT = 5555;

server.listen(PORT, () => {
  console.log(`*** Server running on port ${PORT} *** `);
});
