<script>
    import Dialog from "$lib/Dialog.svelte";
    import { slide } from "svelte/transition";
    import {boolean, text, timestamp, varchar} from "drizzle-orm/pg-core";
    import {onMount} from "svelte";

    let { data } = $props();

    let drafts = $state([]);
    let currentlySelected = $state(null);

    const createDraft = () => {
        const newDraft = {
            id: "draft_" + crypto.randomUUID(),
            type: "post",
            title: "New Draft",
            content: "This is a new draft. Edit me!",
            username: data.user.username,
            authorId: data.user.id,
            sentByGuest: data.user.isGuest,
        };
        drafts.push(newDraft);
        currentlySelected = newDraft.id;
    }

    function exitIfDraft(event) {
        if (drafts.length > 0) event.preventDefault();
        event.returnValue = drafts.length > 0 ? "true" : null;
        return drafts.length > 0 ? "true" : null;
    }
</script>

<svelte:window on:beforeunload={exitIfDraft}></svelte:window>

{@debug drafts}

<div >
    <div class="absolute inset-0 -z-50 bg-[#242424]">
        <div class="absolute inset-0 bg-[url('/background/wave8.svg')] bg-cover bg-center wave-animation [animation-duration:6s] -z-42"></div>
        <div class="absolute inset-0 bg-[url('/background/wave7.svg')] bg-cover bg-center wave-animation [animation-duration:9s] -z-43"></div>
        <div class="absolute inset-0 bg-[url('/background/wave6.svg')] bg-cover bg-center wave-animation [animation-duration:12s] -z-44"></div>
        <div class="absolute inset-0 bg-[url('/background/wave5.svg')] bg-cover bg-center wave-animation [animation-duration:15s] -z-45"></div>
        <div class="absolute inset-0 bg-[url('/background/wave4.svg')] bg-cover bg-center wave-animation [animation-duration:18s] -z-46"></div>
        <div class="absolute inset-0 bg-[url('/background/wave3.svg')] bg-cover bg-center wave-animation [animation-duration:21s] -z-47"></div>
        <div class="absolute inset-0 bg-[url('/background/wave2.svg')] bg-cover bg-center wave-animation [animation-duration:24s] -z-48"></div>
        <div class="absolute inset-0 bg-[url('/background/wave1.svg')] bg-cover bg-center wave-animation [animation-duration:27s] -z-49"></div>
    </div>
    <main class="">
        <div class="flex flex-row justify-between items-center p-2 max-w-3xl mx-auto">
            <h1 class="text-4xl font-bold">AtomChatDB</h1>

            <div class="flex flex-col space-x-2 backdrop-blur-3xl p-2">
                <span>{data.address.address}</span>
                <span>{data.user.username}</span>
            </div>
        </div>
        <div class="w-11/12 mx-auto rounded-t-[75px] min-h-[calc(100vh-80px)] h-[calc(100vh-80px)] bg-neutral-500/10 backdrop-blur-md" transition:slide>
            {#await data.data}
                loading...
            {:then posts}
                <div class="pt-5 flex flex-col h-full">
                    <div class="pt-1 pb-2 mx-[200px] flex flex-row justify-between">
                        <div>
                            {posts.length} items
                        </div>
                        <div class="flex flex-row space-x-2">
                            <button class="font-bold underline cursor-pointer" onclick={() => createDraft()}>create post</button>
                            <a href="/" class="font-bold underline cursor-pointer">disconnect</a>
                        </div>
                    </div>
                    <hr class="w-full mx-auto">
                    <!-- actual menus -->
                    <div class="mx-2 flex flex-row inset-0 h-full">
                        <!-- list -->
                        <div class="h-full border-r-2 border-neutral-500 inset-0 w-1/2 pr-2">
                            {#if posts.length > 0 || drafts.length > 0}
                                {#each drafts as draft (draft.id)}
                                    <button class="flex flex-row items-center space-x-2 hover:bg-neutral-500/20 p-2 rounded-md cursor-pointer w-full"
                                         onclick={() => {
                                             currentlySelected = draft.id;
                                         }}>
                                        <span class="w-10 h-10 bg-neutral-500/20 rounded-full flex shrink-0 items-center justify-center">
                                            <span class="text-lg font-bold">{draft.title[0]}</span>
                                        </span>
                                        <span class="flex flex-col items-start grow-0">
                                            <span class="font-bold">{draft.title}</span>
                                            <span class="text-sm text-neutral-400 overflow-ellipsis line-clamp-1 ">{draft.content.slice(0, 75)}...</span>
                                        </span>
                                    </button>
                                {/each}
                                {#each posts as post (post.id)}
                                    <button class="flex flex-row items-center space-x-2 hover:bg-neutral-500/20 p-2 rounded-md cursor-pointer w-full"
                                         onclick={() => {
                                             currentlySelected = post.id;
                                         }}>
                                        <span class="w-10 h-10 bg-neutral-500/20 rounded-full flex shrink-0 items-center justify-center">
                                            <span class="text-lg font-bold">{post.title[0]}</span>
                                        </span>
                                        <span class="flex flex-col items-start grow-0">
                                            <span class="font-bold">{post.title}</span>
                                            <span class="text-sm text-neutral-400 overflow-ellipsis line-clamp-1 ">{post.content.slice(0, 75)}...</span>
                                        </span>
                                    </button>
                                {/each}
                            {:else}
                                <div class="flex flex-row items-center space-x-5">
                                    <pre>


⠀⠀⡾⠻⢶⠶⣤⣄⠀⠀⠀⢀⣀⣀⡀⠀⠀⣀⣀⣀⣤⣤⣤⠤⠤⣤⣤⣤⠄⠀
⠀⠀⡇⠀⠀⠉⠢⣈⠛⠛⠛⠉⠉⠉⠉⠛⠋⠉⠉⠀⠀⢀⠠⠔⠊⢉⡼⠋⠀⠀
⠀⠀⣇⠀⠀⠀⠀⠈⠣⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠞⠁⠀⠀⣠⠟⠁⠀⠀⠀
⠀⠀⣿⠀⠀⠀⠀⠀⠀⠈⡄⠀⠀⠀⠀⠀⠀⠀⠀⡆⠀⠀⠀⠀⡏⠀⠀⠀⠀⠀
⠀⢀⡟⠢⢀⡀⠀⠀⣀⠠⠓⠀⠀⠀⠀⠀⠀⠀⠀⠈⢆⡀⠀⢀⡇⠀⠀⠀⠀⠀
⠀⡾⠀⠀⠀⠈⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣶⠞⠁⠀⠀⠀⠀⠀
⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀
⣾⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠀⠀⠀⠀⠀⠀
⣷⠀⠀⠀⠀⠀⠀⠈⢫⠋⣿⡖⢦⠀⠀⠀⢀⡴⣿⢙⡏⢉⡏⠀⠀⠀⠀⠀⠀⠀
⠘⢷⠀⠀⠀⠀⠀⠀⠀⠑⠂⠀⠓⢣⠀⠀⡞⠓⠚⠊⠀⠈⠙⢦⡀⠀⠀⠀⠀⠀
⠀⢸⡇⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠘⡄⢀⠇⠀⢀⠔⠁⠀⠀⠀⠙⢦⡀⠀⠀⠀
⠀⠀⡇⠀⠀⠀⠑⠤⡀⠀⠀⠀⠀⠀⣗⡜⠀⡠⠃⠀⠀⠀⠀⠀⠀⠈⠻⣄⠀⠀
⠀⠀⡇⠀⠀⠀⠀⠀⠈⠐⠤⢀⣀⣉⣉⠦⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣆⠀
⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⢹⡄
⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡄⠀⠀⢷
⠀⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢸
⠀⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⠀⠀⢸
⠀⠀⠸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⢠
⠀⠀⠀⢻⡀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⢸
⠀⠀⠀⠘⣧⠀⠀⠀⠘⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀⣸
⠀⠀⠀⠀⢹⡀⠀⠀⠀⠘⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡎⠀⠀⠀⢠⡏
⠀⠀⠀⠀⠸⡇⠀⠀⠀⠀⠀⢱⡦⣤⣀⣀⣠⣤⡀⠀⠀⠀⠀⠀⠇⠀⠀⠀⣾⠁
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠘⡇⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⣼⠃⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢀⡾⠁⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⠇⠀⠀⠀⠀⠀⡴⠋⠀⠀⠀⠀
⠀⠀⠀⠀⣾⠋⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⢠⡟⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣀⡆⠀⠀⠀⠀⢀⡟⠀⠀⠀⠸⣆⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠙⣧⣀⣾⣤⡤⠞⠁⠀⠀⠀⠀⠙⣦⣄⣰⣧⣬⣿⠟⠀⠀⠀⠀⠀
                            </pre>
                                    <div>
                                        <h1 class="text-xl font-bold">no posts...</h1>
                                        <div>why don't you get something started?</div>
                                        <div>create a post (button on the top right)</div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <!-- reader -->
                        <div class="h-full w-1/2 pl-2">
                            {#if currentlySelected}
                                <!-- draft editor form -->
                                {#if currentlySelected.startsWith('draft')}
                                    {@const draft = drafts.find(d => d.id === currentlySelected)}
                                    <form method="POST" action="?/createPost" enctype="multipart/form-data" class="h-full flex flex-col">
                                        <div class="w-full px-2 py-2 border-b-2 border-neutral-500">
                                            To: <b>{data.address.address}</b>
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
                                            <input type="file" name="image" accept="image/*" class="file:bg-neutral-500 file:cursor-pointer file:px-1" />
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
                                        <div class="flex flex-row">
                                            <button onclick={() => { drafts = drafts.filter(v => v.id !== draft.id); currentlySelected = null; }} class="mb-2 p-2 cursor-pointer hover:bg-neutral-500/50 active:bg-neutral-600/50 shrink">delete</button>
                                            <button class="mb-2 p-2 cursor-pointer border-2 border-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 grow">submit</button>
                                        </div>
                                    </form>
                                {:else}
                                <!-- post reader crap -->
                                    {@const post = posts.find(p => p.id === currentlySelected)}
                                    <div class="h-full flex flex-col">
                                        <div class="w-full px-2 py-2 border-b-2 border-neutral-500">
                                            To: <b>{data.address.address}</b>
                                        </div>
                                        <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
                                            <span class="font-bold">{post.title}</span>
                                            <span class="text-sm text-neutral-400">by {post.username} on {post.createdAt.toLocaleDateString()}</span>
                                        </div>
                                        <div class="flex flex-col w-full h-full px-2 py-2">
                                            <p class="whitespace pre-wrap break-words">{post.content}</p>
                                            {#if post.image}
                                                <img src={post.image} alt="Post image" class="max-w-full max-h-96 object-contain mt-2" />
                                            {/if}
                                        </div>
                                        <div class="flex flex-row">
                                            <button onclick={() => { currentlySelected = null; }} class="mb-2 p-2 cursor-pointer hover:bg-neutral-500/50 active:bg-neutral-600/50 shrink">back</button>
                                            <button class="mb-2 p-2 cursor-pointer border-2 border-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 grow">reply</button>
                                        </div>
                                    </div>
                                {/if}
                            {:else}
                                nothing selected...
                            {/if}
                        </div>
                    </div>
                </div>
            {/await}
        </div>
    </main>
</div>