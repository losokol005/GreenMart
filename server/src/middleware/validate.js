// validate(schema, 'body' | 'query' | 'params'): replaces the input with the parsed (typed, stripped) value.
module.exports = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(result.error);
  req[source] = result.data;
  return next();
};
