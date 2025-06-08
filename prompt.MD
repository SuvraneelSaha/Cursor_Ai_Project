i am building a portal where I as a jobseeker can come paste a JD and my generic resume and then based on the JD the portal will change the content of my resume such that it fits more specific to that JD which is supplied. For example lets say I have created a resume which is generic to software development, but I do happen to have worked on Python & Numpy so i can be considered capable for a data analyst role as welll. So, those projects of mine, those work experience gets highlighted while applying for a Data Analyst role.

Here is how a general user story looks like:

- first screen asks me to upload my resume in pdf
- second screen asks me to upload the JD content in pure text
- then the application works internally and gives me a final resume specially suited for that jd
- internally we will use relevant openAI model to call and adjust the content of resume.
- Finally the last page demonstrates the resume

I am giving this context to a coding agent Cursor. In order to avoid any hallucination or loss of context, tell me what should I do. if there is something unanswered let me know so that when given to coding agent it has no scope of hallucination or taking decision on its own

3rd Step - Product description/requirement document from chat gpt in full detail ;
Also criticise the pD from another llm

4th Step - Keep the color theme

5th Step - copy the pD to the cursor -- keep it always option

#DaretoMisogi

6th - Make a generic resume using chat gpt
