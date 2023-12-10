export const generateRef = (length: number) => {
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};

export const generateHash = () => {
  const key = `FINTAVA_TX_REF${generateRef(12)}`.toUpperCase();
  return key;
};
