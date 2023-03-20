const isURL = (url: string) => {
  try {
    new URL(url);
  } catch (err) {
    return false;
  }
  return true;
};

export { isURL };
export default isURL;
