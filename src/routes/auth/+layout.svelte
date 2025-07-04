<script>
    let { children } = $props();
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
            {@render children()}
        </div>
    </main>
</div>








