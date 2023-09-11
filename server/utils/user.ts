import { Session } from '@auth/core/types'
import prisma from './prisma'
import { Account } from '@prisma/client'

export async function getUser(
  session: Session | null
): Promise<Array<Account> | undefined> {
  if (session?.user?.name) {
    return await prisma?.account.findMany({
      where: { providerAccountId: session?.user?.name },
    })
  }
}
