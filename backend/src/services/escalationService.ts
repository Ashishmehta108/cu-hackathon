import * as cron from 'node-cron';
import * as complaintService from './complaintService';

export function startEscalationAgent() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running escalation agent...');
        await escalateComplaints();
    });
}

async function escalateComplaints() {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    // Get all pending or in_progress complaints
    const complaints = await complaintService.getComplaints({ status: 'pending' });
    const inProgress = await complaintService.getComplaints({ status: 'in_progress' });
    const allUnresolved = [...complaints, ...inProgress];

    for (const complaint of allUnresolved) {
        if (!complaint.createdAt) continue;
        const createdAt = new Date(complaint.createdAt);
        const escalationLevel = complaint.escalationLevel ?? 0;

        if (createdAt <= fifteenDaysAgo && escalationLevel < 3) {
            await escalateComplaint(complaint.id!, 3);
        } else if (createdAt <= sevenDaysAgo && escalationLevel < 2) {
            await escalateComplaint(complaint.id!, 2);
        } else if (createdAt <= threeDaysAgo && escalationLevel < 1) {
            await escalateComplaint(complaint.id!, 1);
        }
    }
}

async function escalateComplaint(complaintId: string, newLevel: number) {
    await complaintService.updateComplaint(complaintId, {
        escalationLevel: newLevel,
        lastEscalationDate: new Date().toISOString(),
        // Optionally, update department or status
    });
    console.log(`Escalated complaint ${complaintId} to level ${newLevel}`);
}
