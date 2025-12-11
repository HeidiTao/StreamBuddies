# StreamBuddies 
<img src="assets/stream_buddies_wBG.jpg" alt="StreamBuddies logo" width="6%">

CMU F25 67-443 Mobile Application Design and Development Project

by Team 10: Isabelle Anis, Riya Kinny, and Heidi Tao

In the era of streaming, the simple question “What should we watch?” has become work. With multiple services and endless catalogs, people hit choice overload fast. StreamBuddies is a unified hub that surfaces everything you can actually watch across the subscriptions you already pay for. Getting started is quick: log your services and sync contacts. Create friend groups for watch nights, and StreamBuddies automatically builds a shared catalog that includes only titles available to everyone in the group. From there, deciding, queuing, and pressing play is simple. 

[Promo Video](https://drive.google.com/file/d/13EmKHIihBJyUj6Dd-v-5P9xxoOXdGRtn/view?usp=drive_link) (video quality might be better when downloaded)

<img src="assets/team10_StreamBuddies_poster.png" alt="StreamBuddies poster" width="30%">

---
## Tech stack
- React Native
- Firebase 
- Firebase Auth
- TMDB API

## To run tests
1. Run `npm test` in a terminal. This will run all the unit tests and show coverage data.
2. A coverage stats dashboard is also available at `/coverage/lcov-report/index.html`

## To contribute to this project:

1. Git clone the repository to your local machine or run `git pull` to get the updates.
2. Run `npm install` to install or update dependencies.

**Note:** Currently, API keys are stored in the `.env` in the github repo for easier grading access. For actual development, this `.env` file shall be included in gitignore.

## To try out the app!
3. Run `npm start` to start the server.
4. If you've recently opened the app, open the **Expo Go** App on your mobile device and find **StreamBuddies**. Or, scan the QR code that appeared in your terminal to load the app. All edits to code will be shown live on the mobile device.

**To test the authentication feature**: We use Firebase Auth for user authentication. To prevent sending SMS texts to real phone numbers, Firebase Auth provides testing numbers + verification code combinations that can be set up in the Firebase console. For simulating the feature, you can enter the test number in the phone number field, complete the reCAPTCHA verification, then fill in the corresponding verification code on the following page. The correct combination will lead you to the profile page or register page, depending on whether there already exists a user with that number.

Below are the available combinations to test **creating new accounts** (i.e., these users do not exist before 2025/12/11 9am). However, if they are tested by a grader, then using the same combination will directly lead to the profile page instead of the registration page. 
|  Phone number |  Verification Code |
|:--------------|:------------------:|
| +1 0001110001 | 010101 |
| +1 0002220002 | 020202 |
| +1 0003330003 | 030303 |
| +1 0004440004 | 040404 | 

Below are combinations for accounts that are **already registered as users** in our app. You can use these pairs to directly log in:
|  Phone number |  Verification Code |
|:--------------|:------------------:|
| +1 999-999-9999 | 999999 |
| +1 412-909-6001 | 040409 |
| +1 555-000-5555 | 505050 |
| +1 234-567-8900 | 123456 |
| +1 674-436-7443 | 000000 |

---
## Highlights of the app

### Design Decisions
- **Swipeable interface for discovering titles**: 
Users can quickly brose movies and TV shows through a swipeable card interface on the home page. This allows for rapid exploration of content and fun interaction. This screen is a highlight of our application because of its gamified way to find new titles without overwhelming the users with too many options. 

- **Grid view for the trending catalog**: 
Alongside swiping, our app also provides a more classic grid view to allow users to scroll through and see posters with titles at a glance. This complements the swiping feature, catering to users who prefer scanning multiple options simultaneously. 

- **Group creation and management**: 
One key part of our app is to allow users enjoy watching movies and shows with their friends and family, fostering social bonding. With the group feature, users can collaboratively collect, plan, and discuss about contents that bring them joy, excitement, reflections, awe, and inspirations.

- **Watchlists functionality**: 
From our initial user surveys, being able to save content to lists is one of the most popular features. Each user can create multiple lists based on their own interests and organization.

- **Watchstats logging**: 
Some users want to know how long they spend on watching shows - we provide a watch stats page linked through the users' profile. Users can choose to log the full timelength of a movie, or the length of time they've spent that day. There are also summary statistics for each month and year, as well as category breakdowns by genre. 

### Tech Decisions
- **Authentication**:
We chose to use signInWithPhoneNumber instead of other methods (e.g., email, Google, etc.) since using phone number is the most direct and convenient method for a mobile application. 

- **[TMDB API](https://developer.themoviedb.org/)**: 
TMDB (The Movie Database) not only has a comprehensive collection of movies and TV shows, but also convenient API endpoints that support searching and filtering with clear documentation. It is also free for non-commercial use, which makes it perfect for the developing phase. The attribution is included at the bottom of the logged-in profile page. 
You can acquire your own API keys by registering for a TMDB account, and requesting a key within the [accounts setting page](https://www.themoviedb.org/settings/api).

- **Unit testing with Jest**:
Jest is a testing framework that integrates very well with React Native apps. It provides coverage reports and mock functions to separate testing vs non-testing scopes. 

---

## Notes on Technical Issues
- Watchstats are currently local data. It is not linked to each user in our database, and doesn't always preserve across builds.
- Profile edits is not linked with database yet.
- The shortcuts for watchlists and groups from the profile page currently link to the overall tabs; in future iterations, they could be linked to the specific lists or groups detail pages.
  
## Future Development
- Continue to improve user flow (e.g., adding confirmation messages for adds and deletes)
- Allow users to add movies or shows to watchlists on create
- Direct link to streaming platforms - when users want to play a movie, they can simply click a link or button on our application that would open the corresponding streaming platform on their device
- Allow multi-selection on explore page filters
- Allow users to create shared watchlists for groups
- Enable customized watchlist covers, group icons, and profile pictures.

**[Kanban Board](https://www.notion.so/279a364145b88096a5affb1f922cd274?v=279a364145b8810a89e7000c8319f5cb&source=copy_link)**
