function withErrorHandling(defaultCode, handler, statusByCode = {}) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      const mappedStatus = statusByCode[err.code];
      if (!mappedStatus) console.error(err);
      res.status(mappedStatus || 500).json({ error: { code: mappedStatus ? err.code : defaultCode, message: err.message } });
    }
  };
}

module.exports = { withErrorHandling };
