<script lang="ts">
  import functions from '$lib/api/tauri';

  function confirmPassword() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
    if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  }

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const response = await functions.register({
      username: formData.get('username') as string,
      //handle: formData.get('handle/email') as string,
      password: formData.get('password') as string,
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      location.assign('/app');
    }

    return response.message && alert(response.message);
  }
</script>

<form {onsubmit} class="w-full max-w-sm mx-auto">
  <div class="mb-4">
    <label class="block text-sm mb-2" for="username">
      Username
      <span class="text-red-600">*</span>
    </label>
    <input
      type="text"
      id="username"
      name="username"
      placeholder="noro"
      autocomplete="username"
      minlength="3"
      maxlength="32"
      oninput={(e) =>
        (e.currentTarget.value = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-_.]/gi, ''))}
      required
    />
  </div>
  <div class="mb-4">
    <label class="block text-sm mb-2" for="password">
      Password
      <span class="text-red-600">*</span>
    </label>
    <input
      type="password"
      id="password"
      name="password"
      placeholder="********"
      minlength="8"
      oninput={confirmPassword}
      required
    />
  </div>
  <div class="mb-4">
    <label class="block text-sm mb-2" for="confirm-password">
      Confirm Password
      <span class="text-red-600">*</span>
    </label>
    <input
      type="password"
      id="confirm-password"
      name="confirm-password"
      placeholder="********"
      oninput={confirmPassword}
      required
    />
  </div>
  <div class="my-4 text-center">
    <input
      type="checkbox"
      id="terms"
      name="terms"
      class="bottom-0 h-5 left-0 right-0 top-0 !w-5"
      required
    />
    <label for="terms" class="cursor-pointer">
      I agree to the <a href="/terms">terms and conditions</a>.
    </label>
  </div>
  <button class="text-sm py-2 px-4 rounded-md transition duration-300 float-right" type="submit">
    Register
  </button>
  <slot />
</form>

<style lang="postcss">
  @reference "tailwindcss";

  input {
    @apply px-3 py-2 w-full bg-gray-500 text-white placeholder:text-gray-300;
    @apply rounded-md border-2 border-t-red-800 border-l-red-800 border-red-600;
    &:focus {
      @apply outline-none;
      @apply border-t-purple-600 border-l-purple-600 border-purple-800;
    }
  }

  button[type='submit'] {
    @apply cursor-pointer bg-indigo-500;
    @apply rounded-md border-2 border-t-white border-l-white border-blue-700;
    &:hover {
      @apply bg-indigo-600;
    }
    &:focus {
      @apply outline-none;
      @apply border-b-white border-r-white border-blue-700;
    }
  }
</style>
