<script>
    let {
        onclick,
        class: class_,
        children
    } = $props();

    let isStage = $state(false);
    let timeout;

    async function handleClick(event) {
        if (isStage) { await onclick?.(event) }
        else {
            isStage = true;
            timeout = setTimeout(() => {
                isStage = false;
            }, 2000);
        }
    }
</script>

<button class={class_} onclick={handleClick}>{@render children()}{isStage ? '?' : ''}</button>