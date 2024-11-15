const nodemailer =require('nodemailer')

const transporter = nodemailer.createTransport({//mail mnin bich bich yitb3ath
  service: 'gmail',
  auth: {
    user: 'saharsaidani8@gmail.com',
    pass: 'Sahar123!',
  },
})

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: 'saharsaidani8@gmail.com',
      to,
      subject,
      text,
    })
    console.log(`Email envoyé à ${to}`)
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email :', error)
  }
};

module.exports = sendEmail
