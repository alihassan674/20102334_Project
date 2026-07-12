Hi Mr. Paul,
My name is Ali Hassan and my student ID is 20102334,
In this Readme file,
1) About Project: I have explained each and every thing about Project
2) Procedure of making the project: I have explained step by step procedure of making this project



====================== (1) About Project: ===============================

Introduction:
Lodgely is website to help university hostel manangement , This website help you to manage universtiy hostel, room, and students. This website help you to get rid of paperwork, and manual records of students and rooms. You can manage your hostel, room, and students in a systematic way.

Technologies:
Project contain:
1) frontend (frontend folder in directory):
Frontend or UI is built using Next.js
2) backend (backend folder in directory):
Backend is built using express.js, which is Node.js framework. 
3) database:
Database is built using postgresql

====================== (2) Procedure of making the project: ===============================

1) I initialized frontend setup of Nextjs using `npx create-next-app@latest frontend --yes`, which inititalized nextjs with typescript, tailwindcss, App router, and with all other necessary dependencies.
Reference: https://nextjs.org/docs/app/getting-started/installation
2) Removed unwanted file from code that code by Default
3) Write create hostel form in frontend myself with 
4) then i created backend using their official website express example
Reference: https://expressjs.com/en/5x/starter/installing/
5) then i setup prisma orm with the help of Chatgpt and setup database and seed some data
Reference: https://chatgpt.com/share/6a527d46-c574-83e8-80b6-7a347fc66e1d
6) now i wrote code to fetch all hostels and made cards to shown on homepage, and faced a dyhyderation and solve it with adding `suppressHydrationWarning` in layout file
Reference: https://chatgpt.com/share/6a52a0fc-018c-83ee-8279-68b2e59f2266
7) Now all hostels are showing in homepage, now i m going to add a feature , when i click hostel all room insdide it should shown, and url should update with new url, for this i learned about routing from greekforgeeks
REference:
https://www.geeksforgeeks.org/reactjs/next-js-routing/ ,
https://www.google.com/search?q=how+get+parameter+value+in+nextjs&oq=how+get+parameter+value+in+nextjs&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTEwMjgzajBqNKgCALACAA&sourceid=chrome&ie=UTF-8 ,
https://share.google/aimode/iv3bjyTOiPEXtYXoM
8) implemented get api inside backedn for fetching all romms when i passed hostelid with it, api help from 
Reference: https://chatgpt.com/share/6a535d12-a39c-83e8-b066-450f0639f77d
9) now api data is shown inside rooms page with using map to show array data

