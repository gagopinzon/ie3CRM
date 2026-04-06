import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).populate('role');

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta');
        }

        const roleObj = typeof user.role === 'object' && user.role !== null ? (user.role as any) : null;
        const roleCode = roleObj?.code ?? 'viewer';
        const allPermissions = {
          canManageUsers: true,
          canManageProjects: true,
          canManageClients: true,
          canManageDocuments: true,
          canManageCategories: true,
          canManageDocumentTypes: true,
          canManageInventory: true,
          canViewAllProjects: true,
          canEditAllProjects: true,
        };
        const noPermissions = {
          canManageUsers: false,
          canManageProjects: false,
          canManageClients: false,
          canManageDocuments: false,
          canManageCategories: false,
          canManageDocumentTypes: false,
          canManageInventory: false,
          canViewAllProjects: false,
          canEditAllProjects: false,
        };
        let permissions =
          roleCode === 'admin'
            ? allPermissions
            : roleObj?.permissions
              ? {
                  canManageUsers: !!roleObj.permissions.canManageUsers,
                  canManageProjects: !!roleObj.permissions.canManageProjects,
                  canManageClients: !!roleObj.permissions.canManageClients,
                  canManageDocuments: !!roleObj.permissions.canManageDocuments,
                  canManageCategories: !!roleObj.permissions.canManageCategories,
                  canManageDocumentTypes: !!roleObj.permissions.canManageDocumentTypes,
                  canManageInventory: !!roleObj.permissions.canManageInventory,
                  canViewAllProjects: !!roleObj.permissions.canViewAllProjects,
                  canEditAllProjects: !!roleObj.permissions.canEditAllProjects,
                }
              : noPermissions;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: roleCode,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
