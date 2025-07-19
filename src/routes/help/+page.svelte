<div class="grid place-items-center h-screen overflow-y-scroll">
    <div class="block text-left max-w-2xl *:py-2 p-5">
        <a href="/" class="underline">&lt; main</a>
        <h1 class="text-3xl font-bold">Welcome to AtomChatDB</h1>
        <h3 class="text-xl font-semibold">by atomtables</h3>
        <p>
            AtomChatDB is an application meant to mimic the days of Usenet, with groups being identified through the
            use of a 4-part address system. Similar to the old Usenet, groups can be created in the news.groups.proposals
            group, and once approved, they can be connected to.
        </p>
        <p>
            Unlike Usenet, AtomChatDB is a centralised system. It runs on a single server and data is stored in a central
            database that I have to manage. For this reason, it has much more moderation on user activities than what most
            Usenet servers ever had. Another difference is that on top of forum posts, AtomChatDB also supports the
            use of chatrooms, so websocket message rooms.
        </p>
        <h2 class="text-2xl font-bold">Creating new groups</h2>
        <p>
            For the sake of moderation, creating new groups anywhere outside of alt.* is not allowed. To create a new group,
            you can either go through the creation request process, which is accessible from the main page (go to an address
            that doesn't exist first) or create a new post in the news.groups.proposals group. One note is that
            the news.groups.proposals bot only accepts posts in a certain format, so going through the creation request
            process is probably easier
        </p>
        <h2 class="text-2xl font-bold">Connecting to a group</h2>
        <p>
            To connect to a group, you must be authenticated through some method. You can either create an account or
            you can connect as a guest. Note that guest accounts are significantly limited and include their public
            IP address as their primary identifier.
        </p>
        <p>
            Once authenticated, you can connect to any group that exists. Connect to a group by entering its 4-part
            identifier on the main page. The identifier is made up of the domain, class, focus, and topic. An address
            requires at least a domain and a class, but can also include a focus and a topic.
        </p>
        <h2 class="text-2xl font-bold">The User (almighty)</h2>
        <p>
            User accounts require either a phone number or an email address to be created (to reduce on spam). Once created,
            you can log in and out of your account, and you can also connect as a guest. Guest accounts are limited
            to a single connection per IP address. Normal user accounts can have a profile picture as well. Usernames
            can never be changed and are permanently associated with the account. Every post made includes the user's
            username. Users can delete posts at any time, but deleted posts may still show the subject title. Chats can
            be deleted freely.
        </p>
        <h2 class="text-2xl font-bold">Source Code</h2>
        <p>
            You can find the source code for this application at
            <a href="//github.com/atomtables/atomchatdb" class="underline">Github: atomtables/AtomChatDB</a> and submit issues or pull
            requests there (if you care, the app is coded so horribly anyways).
        </p>
        <a href="/" class="underline">&lt; main</a>
    </div>
</div>