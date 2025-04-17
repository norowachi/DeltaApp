// TODO: add native functions here

async function login(params: {
  username?: string;
  handle?: string;
  password?: string;
}): Promise<{ message: string; token?: string }> {
  let username = params.username;
  let handle = params.handle;
  const password = params.password;

  if (!username && !handle) return { message: 'No login method provided ' };
  if (!password) return { message: 'No password provided' };

  const auth = await fetch('https://api.noro.cc/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, handle, password }),
  }).catch(() => {});

  const data = await auth?.json().catch(() => {});

  if (!data || !data.token) return { message: data.message || 'Internal Server Error' };

  return { message: data.message, token: data.token };
}

async function register(params: {
  username?: string;
  handle?: string;
  password?: string;
}): Promise<{ message: string; token?: string }> {
  let username = params.username;
  let handle = params.handle;
  const password = params.password;

  if (!username && !handle) return { message: 'No login method provided' };
  if (!password) return { message: 'No password provided' };

  const auth = await fetch('https://api.noro.cc/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, handle, password }),
  }).catch(() => {});

  const data = await auth?.json().catch(() => {});

  if (!data || !data.token) return { message: data.message || 'Internal Server Error' };

  return { message: data.message, token: data.token };
}

const native = {
  login,
  register,
  fetch,
  update: async (): Promise<void> => {},
  checkForUpdate: async (): Promise<boolean> => false,
};

export default native;
