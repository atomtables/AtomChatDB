<script>
    import {enhance} from "$app/forms";
    import {invalidate} from "$app/navigation";

    let {
        draft = $bindable(),
        discard,
        currentlySelected = $bindable(),
        address,
        isLoadingPosts = $bindable(),
        getPosts,
        form
    } = $props();
</script>

<form method="POST" action="?/createPost" enctype="multipart/form-data"
      class="h-full flex flex-col" use:enhance={({form}) => {
          isLoadingPosts = true;
          return async ({ result }) => {
              if (result.type === 'success') {
                  discard(draft);
                  currentlySelected = null;
                  await getPosts();
                  currentlySelected = result.data.data;
              } else {
                  console.error("Failed to create post:", result);
              }
              isLoadingPosts = false;
          };
      }}>
    <div class="px-2 text-sm text-neutral-400">leaving this post will discard your draft.</div>
    <div class="w-full px-2 py-2 border-b-2 border-neutral-500">
        To: <b>{address}</b>
    </div>
    <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
        <label for="title">Title: </label>
        <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="subject"
                bind:value={draft.title}
                class="border-b-1 border-neutral-500 w-full field-sizing-[normal]"
        >
    </div>
    <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
        <label for="title">Image (optional): </label>
        <input type="file" name="image" accept="image/*"
               class="file:bg-neutral-500 file:cursor-pointer file:px-1"/>
    </div>
    <div class="flex flex-col w-full h-full px-2 py-2">
        <textarea
                id="content"
                required
                name="content"
                placeholder="write your post here..."
                bind:value={draft.content}
                class="h-full border-b-1 border-neutral-500 w-full resize-none"
        ></textarea>
    </div>
    <div class="text-red-500">
        {#if form?.message}
            <div class="text-red-500 text-center pt-2 inline">
                {form.message}
            </div>
        {/if}
    </div>
    <div class="flex flex-row">
        <button onclick={() => discard(draft)}
                class="mb-2 p-2 cursor-pointer hover:bg-neutral-500/50 active:bg-neutral-600/50 shrink">
            delete
        </button>
        <button
                class="mb-2 p-2 cursor-pointer border-2 border-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 grow"
                type="submit"
        >
            submit
        </button>
    </div>

</form>