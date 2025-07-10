<script>
    let { form } = $props();
</script>

<form method="POST" enctype="multipart/form-data"
      class="h-full flex flex-row">
    <div class="flex flex-row space-x-2 w-full px-2 py-2">
        <label for="title">Change Profile Picture: </label>
        <input type="file" name="image" accept="image/*"
               class="file:bg-neutral-500 file:cursor-pointer file:px-1"/>
    </div>
    <div class="text-red-500">
        {#if form?.message}
            <div class="text-red-500 text-center pt-2 inline">
                {form.message}
            </div>
        {/if}
    </div>
    <div class="flex flex-row">
        <button
                class="mb-2 p-2 cursor-pointer border-2 border-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 grow"
                type="submit"
        >
            submit
        </button>
    </div>

</form>