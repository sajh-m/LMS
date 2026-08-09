export const notFoundHanlder = (req, res) => {
  res.status(404).json({ error: "route not found" });
};

// eslint-disable-next-line no-unused-vars -- Express detects error middleware by arg count (4)
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
};
