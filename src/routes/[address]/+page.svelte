<script>
    import Dialog from "$lib/Dialog.svelte";
    import {onMount} from "svelte";
    import {afterNavigate, goto, invalidate} from "$app/navigation";

    let {data, form} = $props();
    let openForm = $state(false);

    onMount(() => {
        invalidate("layout:cooked")
    })

    onMount(() => {
        // Resize inputs on mount
        document.querySelectorAll('input.x1').forEach(input => {
            input.size = input.value.length || 8; // prevent size=0
        });
        invalidate("layout:cooked")
    });


    function resizeInput(event) {
        const input = event.target;

        if (event.data === '.') {
            event.preventDefault();
            input.value = input.value.slice(0, -1);
            const nextfocus = Array.from(document.querySelectorAll("input.x1"))
            nextfocus[nextfocus.indexOf(document.activeElement) + 1].focus();
        }

        if (/[^A-Za-z]/.test(event.data) || input.value.length > 16) {
            input.value = input.value.slice(0, -1);
        }

        input.size = input.value.length || 8; // prevent size=0
    }

    let {domain, class: class_, focus, topic} = $state({
        domain: data.slugs?.domain || '',
        class: data.slugs?.class || '',
        focus: data.slugs?.focus || '',
        topic: data.slugs?.topic || ''
    });

    let everythingIsValid = $derived(
        (data.slugs?.domain ?? '') === domain &&
        (data.slugs?.class ?? '') === class_ &&
        (data.slugs?.focus ?? '') === focus &&
        (data.slugs?.topic ?? '') === topic
    );

    afterNavigate(() => {
        invalidate("layout:cooked")
        domain = data.slugs?.domain || '';
        class_ = data.slugs?.class || '';
        focus = data.slugs?.focus || '';
        topic = data.slugs?.topic || '';
        setTimeout(() => {
            document.querySelectorAll('input.x1').forEach(input => {
                input.size = input.value.length || 8; // prevent size=0
            });
        }, 20)
    })

    async function goToAddress() {
        let url = "/";
        if (domain) {
            url += domain;
        }
        if (class_) {
            url += `.${class_}`;
        }
        if (focus) {
            url += `.${focus}`;
        }
        if (topic) {
            url += `.${topic}`;
        }

        await goto(url);
    }
</script>

<div>
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
    <main class="w-screen h-screen flex flex-col items-center justify-center">
        <div class="flex flex-col items-center justify-center">
            <div class="text-center flex flex-row justify-between items-end w-max">
                <h1 class="text-4xl font-bold w-83 text-left">AtomChatDB</h1>
                <div class="w-48 text-right">by atomtables</div>
            </div>
            <div class="text-center p-2">
                A huge group of people separated by four identifiers.
            </div>

            {#if data.auth}
                <div class="flex flex-row space-x-2 backdrop-blur-3xl p-2">
                    <div>{data.user.isGuest ? 'connected' : 'logged in'} as <b>{data.user.username}</b>
                        ({data.user.person})
                    </div>
                    <a href="/auth/logout" class="underline block text-red-200">log out</a>
                </div>
            {:else}
                <div class="flex flex-row space-x-2 backdrop-blur-3xl p-2">
                    <a href="/auth/login" class="underline block">use an account</a>
                    or
                    <a href="/auth/asguest" class="pl-2 underline block">connect as guest</a>
                </div>
            {/if}

            <div class="flex flex-row space-x-2">
                <div class="bg-neutral-800/10 p-2 my-2 flex flex-row items-end space-x-1 h-14 backdrop-blur-3xl">
                    <input type="text" bind:value={domain} placeholder="domain" class="x1" oninput={resizeInput}
                           tabindex="0" size="8">
                    <div class="-mb-1.75">
                        .
                    </div>
                    <input type="text" bind:value={class_} placeholder="class" class="x1" oninput={resizeInput}
                           tabindex="0" size="8">
                    <div class="-mb-1.75">
                        .
                    </div>
                    <input type="text" bind:value={focus} placeholder="focus" class="x1" oninput={resizeInput}
                           tabindex="0" size="8">
                    <div class="-mb-1.75">
                        .
                    </div>
                    <input type="text" bind:value={topic} placeholder="topic" class="x1" oninput={resizeInput}
                           tabindex="0" size="8">
                </div>
                <button onclick={() => goToAddress()}
                        class="bg-neutral-800/10 transition-colors {everythingIsValid && '!bg-green-700'} h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer"
                        title="go to address">
                    →
                </button>
                <button class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer"
                        title="help">
                    ?
                </button>
            </div>

            <div class="p-2">
                {#if data.address}
                    <div class="flex flex-col">
                        <div class="flex flex-row justify-center items-center space-x-2">
                            <span><b>{data.address.type === 'news' ? 'newsgroup' : 'chatroom' }</b> created by <b>{data.address.createdBy}</b> on {data.address.createdAt.toLocaleDateString()}</span>
                        </div>
                        <span class="max-w-xl text-center text-sm">{data.address.description}</span>
                        <button class="cursor-pointer disabled:cursor-not-allowed disabled:text-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 font-bold p-1 mt-2 border-2 border-neutral-500"
                                disabled={data.user?.isGuest} onclick={() => goto(`/${data.address.address}/news`)}>initiate connection
                        </button>
                    </div>
                {:else}
                    <div class="flex flex-col">
                        <div class="flex flex-row justify-center items-center space-x-2">
                            <span>404 address not found</span>
                            <button class="cursor-pointer disabled:cursor-not-allowed disabled:text-neutral-500 font-bold p-1 border-2 border-neutral-500"
                                    disabled={data.user?.isGuest} onclick={() => openForm = true}>request creation
                            </button>
                        </div>
                        <div class="text-center text-sm max-w-xl pt-2">
                            proposals for new addresses can be filed using the <i>request creation</i> button or can be
                            sent at the
                            address news.groups.proposals. you can check on the progress of your proposal at
                            news.groups.proposals.
                        </div>
                    </div>
                {/if}
            </div>

            <Dialog open={openForm} title="Submit a domain creation request" form="?/createDomain"
                    description="creating domain <i>{data.slugs.domain}</i>" actions={[
                {
                    name: "submit",
                    submit: true
                }, {
                    name: "close",
                    close: true
                }
            ]}>
                <div class="flex flex-col">
                    description of address: (max 1000 chars)
                    <textarea name="description" class="border-2 border-neutral-500 my-2" rows="4" maxlength="1000"/>
                    why this address should be added: (max 1000 chars)
                    <textarea name="whyShould" class="border-2 border-neutral-500 mt-2" rows="4" maxlength="1000"/>
                </div>
                <div class="text-red-500 pt-2">
                    {form?.message}
                </div>
            </Dialog>
        </div>
    </main>
</div>
