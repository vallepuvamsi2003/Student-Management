const nodemailer = require('nodemailer');

const getTransporter = async () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

const sendLoginAlert = async (userEmail, userName, userRole) => {
    // This function is being phased out as per new requirements
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: `"SMS Security" <${process.env.EMAIL_USER || 'no-reply@sms-vault.com'}>`,
            to: userEmail,
            subject: 'Login Alert – Student Management System',
            text: `Hello ${userName}, you have successfully logged in.`
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email alert failure:', error);
    }
};

const sendAdminSignupConfirmation = async (adminEmail, adminName) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: `"SMS Admin System" <${process.env.EMAIL_USER || 'admin@sms-vault.com'}>`,
            to: adminEmail,
            subject: 'Welcome to Student Management System – Admin Registration Successful',
            text: `Hello ${adminName},

Congratulations! Your Admin account has been successfully created in the Student Management System.

As an Admin, you can:
- Manage Student and Teacher accounts
- Oversee Course Management
- Track Attendance and Grades
- Configure System Settings

Please log in to your dashboard to get started.

Thank you,
Student Management System Team`
        };

        const info = await transporter.sendMail(mailOptions);

        if (!process.env.EMAIL_USER) {
            console.log('✅ ADMIN CONFIRMATION EMAIL SENT! (TEST)');
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        } else {
            console.log(`Confirmation email sent to Admin: ${adminEmail}`);
        }
    } catch (error) {
        console.error('Admin signup email failure:', error);
    }
};

const sendStudentPerformanceEmail = async (studentEmail, studentName, performanceRecords) => {
    try {
        const transporter = await getTransporter();
        
        // Generate table rows for each subject
        const tableRows = performanceRecords.map(record => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">${record.subject}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${record.attendancePercentage}%</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${record.marks}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${record.grade}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Student Management System" <${process.env.EMAIL_USER || 'no-reply@sms.com'}>`,
            to: studentEmail,
            subject: 'Performance Report Update - Student Management System',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; color: #1e293b;">
                    <h2 style="color: #6366f1; margin-bottom: 10px;">Academic Performance Update</h2>
                    <p>Hello <strong>${studentName}</strong>,</p>
                    <p>New academic records have been uploaded for you. Here is your consolidated performance report:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
                        <thead>
                            <tr style="background-color: #f8fafc; color: #64748b;">
                                <th style="padding: 12px; text-align: left; border-top-left-radius: 10px;">Subject</th>
                                <th style="padding: 12px; text-align: center;">Attendance</th>
                                <th style="padding: 12px; text-align: center;">Marks</th>
                                <th style="padding: 12px; text-align: center; border-top-right-radius: 10px;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>

                    <p style="margin-top: 30px;">You can view more details and trends on your student dashboard.</p>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
                        <p>This is an automated notification from the Student Management System.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        if (!process.env.EMAIL_USER) {
            console.log(`✅ CONSOLIDATED PERFORMANCE EMAIL SENT TO ${studentEmail}! (TEST)`);
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Email sending failed for', studentEmail, error);
    }
};

module.exports = { sendLoginAlert, sendAdminSignupConfirmation, sendStudentPerformanceEmail };
