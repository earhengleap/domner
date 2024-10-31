// File: scripts/manageGuideApplications.ts

const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendApprovalEmail(email, name) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/guide-dashboard`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Guide Application Has Been Approved',
    text: `Dear ${name},\n\nCongratulations! Your application to become a guide has been approved. Welcome to our team!\n\nYou can now access your guide dashboard at: ${dashboardUrl}\n\nBest regards,\nThe Management Team`,
    html: `
      <p>Dear ${name},</p>
      <p>Congratulations! Your application to become a guide has been approved. Welcome to our team!</p>
      <p>You can now access your guide dashboard at: <a href="${dashboardUrl}">${dashboardUrl}</a></p>
      <p>Best regards,<br>The Management Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending approval email to ${email}:`, error);
  }
}

async function approveApplication(id) {
  try {
    const updatedApplication = await prisma.guideForm.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { user: true },
    });
    console.log(`Application ${id} approved successfully`);
    
    await sendApprovalEmail(updatedApplication.user.email, updatedApplication.fullName);
    
    await prisma.user.update({
      where: { id: updatedApplication.userId },
      data: { role: 'GUIDE' },
    });
    
    return updatedApplication;
  } catch (error) {
    console.error(`Error approving application ${id}:`, error);
  }
}

async function rejectApplication(id) {
  try {
    const updatedApplication = await prisma.guideForm.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    console.log(`Application ${id} rejected successfully`);
    return updatedApplication;
  } catch (error) {
    console.error(`Error rejecting application ${id}:`, error);
  }
}

async function listPendingApplications() {
  try {
    const pendingApplications = await prisma.guideForm.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        fullName: true,
        emailAddress: true,
        guideLicenseNumber: true,
        createdAt: true,
      },
    });
    console.log('Pending applications:', pendingApplications);
    return pendingApplications;
  } catch (error) {
    console.error('Error fetching pending applications:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const applicationId = args[1];

  switch (command) {
    case 'list':
      await listPendingApplications();
      break;
    case 'approve':
      if (!applicationId) {
        console.error('Please provide an application ID to approve');
        process.exit(1);
      }
      await approveApplication(applicationId);
      break;
    case 'reject':
      if (!applicationId) {
        console.error('Please provide an application ID to reject');
        process.exit(1);
      }
      await rejectApplication(applicationId);
      break;
    default:
      console.log('Usage: npm run manage-guides [list|approve|reject] [applicationId]');
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});