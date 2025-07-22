<script>
    import {onMount} from "svelte";

    onMount(() => {
        document.forms['logout'].submit();
    })
</script>

<form method="POST" name="logout">
    Didn't log out? <button>Click here.</button>
</form>