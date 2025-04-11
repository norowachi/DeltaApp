// TODO: add native functions here

async function login(params: {
  username?: string;
  handle?: string;
  password?: string;
}): Promise<{ message: string; token: string }> {
  throw new Error('Native login function not implemented');
}

const native = {
  login,
  fetch,
  update: async (): Promise<void> => {},
  checkForUpdate: async (): Promise<boolean> => false,
};

export default native;
