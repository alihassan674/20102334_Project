Hi Mr. Paul,
My name is Ali Hassan and my student ID is 20102334,
In this Readme file,
1) About Project: I have explained each and every thing about Project
2) Procedure of making the project: I have explained step by step procedure of making this project



====================== (1) About Project: =============================

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

=============== (2) Procedure of making the project: ===================

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
10) implemented the functionality when i click room , user moves to student page of that room
11) added delete button inside hostel, but when i clicked delete button,  faced a issue of opening detail of hostel , instead of calling delete button function so learned abbout propogation and implemented it 
Reference: https://www.w3schools.com/jsref/event_stoppropagation.asp
12) Worked on implemented delete api of hostel based on hostelId in backend and called from fronted delete button
Reference: https://chatgpt.com/s/t_6a539389eeec8191805d256068bb434e
13) i copied the same logic i wrote for deleting hostel and pasted for deleting rooms
14) copied add hostel form modified it and added room form in rooms page
15) Took help from chatgpt to implement edit hostel form 
Reference: https://chatgpt.com/s/t_6a5409d761e481918e2cbf21b8c5efea
16) implemenent edit hostel api in backend for updating hostel data 
Reference: https://chatgpt.com/s/t_6a546104cfd4819187b4ad85ab2a71ee
17) implement edit room form and api using previous pattern
18) implemented edit student form and api using previous pattern 
19) took help from agents to how to deploy webiste, and with their help I made it online and deploy it on GCP, and put backend in docker, 