import pyttsx3
import PyPDF2

sach = open('SE.pdf', 'rb')
pdfReader = PyPDF2.PdfReader(sach)
pages = len(pdfReader.pages)

bot = pyttsx3.init()
voices = bot.getProperty('voices')
bot.setProperty('voice', voices[1].id)

for num in range(8, pages):
    page = pdfReader.pages[num]
    text = page.extract_text()
    bot.say(text)
    bot.runAndWait()
    while bot.isBusy():
        pass

sach.close()