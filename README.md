# AtomChatDB

a usenet-like chatting application. https://chat.atomtables.dev

### Prerequisites:
- NodeJS 24+ and latest PNPM
- PostgreSQL server somewhere
- (developers) Docker Compose (to run the database locally)

### Why?
I had a dream about dialup and internet in the 80s/90s and saw that
usenet was kinda cool. When I saw that it costs way too much money to
run a usenet server, I decided "screw it i can make my own clone." Also
because having separate groups to text friends during school is fun.

### support
only displays with a resolution or scale of 1600x900 or higher will have a good experience.
people with low resolution laptops or no scaling DEs or phones should add responsive design in a PR (please)
also the tablet experience has not been tested.

### How to run (dev):
- clone the repo
- `pnpm run db:start`
- `pnpm install`
- `pnpm run db:push`
- `pnpm run dev`

### How to run (prod):
- `pnpm run build`
- ~~create an expressjs server and use the handler generated.~~
- `mv .env.example .env`
- buy a postgres server to run the database on (write that url into .env)
- also include a file storage service because images get stored in static/public (not implemented)
- if your reverse proxy does not support websockets over same origin, pipe the websockets server port into another domain (and put that into .env)
- `mv runner.prod.example runner.prod`
- modify runner.prod to include your config settings for your environment
- `pnpm run production`
- pray to the gods (whichever you believe in if you do) (that's what I did as well)

### .env
DATABASE_URL and socket

### people from hack club
go to news.groups.proposals, hackclub.demo.news, and hackclub.demo.chat to demo the application.

### for instructions on how to use the app just check the question mark button on the main page
