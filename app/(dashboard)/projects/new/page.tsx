import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProjectPageContent from '@/components/projects/ProjectPageContent';
import connectDB from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';
import Client from '@/models/Client';

async function getFormData() {
  try {
    await connectDB();
    const [documentTypes, clients] = await Promise.all([
      DocumentType.find().sort({ name: 1 }),
      Client.find({ status: 'active' }).sort({ companyName: 1 }),
    ]);
    return {
      documentTypes: JSON.parse(JSON.stringify(documentTypes)),
      clients: JSON.parse(JSON.stringify(clients)),
    };
  } catch (error) {
    console.error('Error fetching form data:', error);
    return { documentTypes: [], clients: [] };
  }
}

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { documentTypes, clients } = await getFormData();

  return (
    <DashboardLayout>
      <ProjectPageContent documentTypes={documentTypes} clients={clients} />
    </DashboardLayout>
  );
}
