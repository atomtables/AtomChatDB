<script>
    let {
        drafts,
        posts,
        currentlySelected = $bindable(),
        loadReplies
    } = $props();
</script>

{#each drafts as draft (draft.id)}
    <button class="flex flex-row items-center space-x-2 mb-2 hover:bg-neutral-500/20 p-2 cursor-pointer w-full"
            onclick={() => {
                currentlySelected = draft.id;
            }}>
        <span class="w-10 h-10 bg-neutral-500/20 rounded-full flex shrink-0 items-center justify-center">
            <span class="text-lg font-bold">{draft.title[0]}</span>
        </span>
        <span class="flex flex-col items-start grow-0">
            <span class="font-bold overflow-ellipsis shrink">{draft.title.slice(0, 28)}{draft.title.length > 28 ? '...' : ''} <span class="text-red-500">(draft)</span></span>
            <span class="text-sm text-neutral-400 overflow-ellipsis line-clamp-1">{draft.content.slice(0, 50)}{draft.content.length > 50 ? '...' : ''}</span>
        </span>
    </button>
{/each}
{#each posts as post, ind (post.id)}
    <button class="flex flex-row items-center space-x-2 mb-2 {currentlySelected === post.id && 'bg-neutral-500/10'} {post.deleted && 'bg-red-700/20'} hover:bg-neutral-500/20 p-2 cursor-pointer w-full"
            onclick={() => {
                currentlySelected = post.id;
                loadReplies(ind);
            }}>
        <span class="w-10 h-10 bg-neutral-500/20 rounded-full flex shrink-0 items-center justify-center">
        <span class="text-lg font-bold">{post.title[0]}</span>
        </span>
        <span class="flex flex-col items-start grow-0">
        <span class="font-bold">{post.title.slice(0, 32)}{post.title.length > 32 ? '...' : ''}</span>
        <span class="text-sm text-neutral-400 overflow-ellipsis line-clamp-1 ">{post.content.slice(0, 50)}{post.content.length > 50 ? '...' : ''}</span>
        </span>
    </button>
{/each}