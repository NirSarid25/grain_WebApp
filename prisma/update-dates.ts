import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:dev.db' })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const dateMap: Record<string, { date: string; endDate: string }> = {
  'Money20/20 USA':                    { date: '2026-10-25', endDate: '2026-10-28' },
  'Money20/20 Europe':                 { date: '2026-06-01', endDate: '2026-06-03' },
  'Sibos':                             { date: '2026-10-05', endDate: '2026-10-08' },
  'Finovate Fall':                     { date: '2026-09-14', endDate: '2026-09-16' },
  'Finovate Europe':                   { date: '2026-02-24', endDate: '2026-02-25' },
  'PayExpo':                           { date: '2026-06-10', endDate: '2026-06-11' },
  'Seamless Middle East':              { date: '2026-05-12', endDate: '2026-05-13' },
  'FinTech Connect':                   { date: '2026-11-23', endDate: '2026-11-24' },
  'EuroFinance':                       { date: '2026-10-07', endDate: '2026-10-09' },
  'AFP Annual Conference':             { date: '2026-10-18', endDate: '2026-10-21' },
  'BAFT Global Annual Conference':     { date: '2026-03-16', endDate: '2026-03-18' },
  'Singapore Fintech Festival':        { date: '2026-11-04', endDate: '2026-11-06' },
  'Fintech Nexus USA':                 { date: '2026-05-20', endDate: '2026-05-21' },
  'Merchant Payments Ecosystem (MPE)': { date: '2026-02-17', endDate: '2026-02-19' },
  'SWIFT Business Forum London':       { date: '2026-04-09', endDate: '2026-04-09' },
  'Currency Research Americas':        { date: '2026-04-06', endDate: '2026-04-08' },
  'Currency Research Europe':          { date: '2026-09-21', endDate: '2026-09-23' },
  'Seamless Asia':                     { date: '2026-09-02', endDate: '2026-09-03' },
  'TransferTo World Connect':          { date: '2026-06-17', endDate: '2026-06-19' },
  'WIRED Money':                       { date: '2026-06-24', endDate: '2026-06-24' },
  'FinovateFall Europe':               { date: '2026-11-17', endDate: '2026-11-18' },
  'Global Travel Forum':               { date: '2026-03-03', endDate: '2026-03-04' },
  'ITB Berlin':                        { date: '2026-03-03', endDate: '2026-03-07' },
  'ATPCO Elevate':                     { date: '2026-05-06', endDate: '2026-05-07' },
  'Bankex':                            { date: '2026-05-13', endDate: '2026-05-14' },
  'iFX EXPO International':            { date: '2026-01-13', endDate: '2026-01-15' },
  'iFX EXPO Asia':                     { date: '2026-07-21', endDate: '2026-07-23' },
  'Payments Leaders Summit':           { date: '2026-09-15', endDate: '2026-09-16' },
  'PAY360':                            { date: '2026-03-24', endDate: '2026-03-25' },
  'FX Week Europe':                    { date: '2026-06-08', endDate: '2026-06-09' },
}

async function main() {
  console.log('Updating conference dates to 2026...')
  for (const [name, { date, endDate }] of Object.entries(dateMap)) {
    await prisma.conference.updateMany({
      where: { name },
      data: { date: new Date(date), endDate: new Date(endDate) },
    })
  }
  console.log('Done — leads and contacts untouched.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
