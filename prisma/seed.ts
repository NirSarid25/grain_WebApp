import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { computeScore } from '../src/lib/scoring'

const adapter = new PrismaLibSql({ url: 'file:dev.db' })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const conferences = [
  { name: 'Money20/20 USA', date: '2026-10-25', endDate: '2026-10-28', city: 'Las Vegas', country: 'USA', vertical: 'fintech', audienceSize: 15000, website: 'https://us.money2020.com' },
  { name: 'Money20/20 Europe', date: '2026-06-01', endDate: '2026-06-03', city: 'Amsterdam', country: 'Netherlands', vertical: 'fintech', audienceSize: 9000, website: 'https://europe.money2020.com' },
  { name: 'Sibos', date: '2026-10-05', endDate: '2026-10-08', city: 'Frankfurt', country: 'Germany', vertical: 'fx', audienceSize: 11000, website: 'https://sibos.com' },
  { name: 'Finovate Fall', date: '2026-09-14', endDate: '2026-09-16', city: 'New York', country: 'USA', vertical: 'fintech', audienceSize: 3000, website: 'https://finovate.com' },
  { name: 'Finovate Europe', date: '2026-02-24', endDate: '2026-02-25', city: 'London', country: 'UK', vertical: 'fintech', audienceSize: 2500, website: 'https://finovate.com/europe' },
  { name: 'PayExpo', date: '2026-06-10', endDate: '2026-06-11', city: 'London', country: 'UK', vertical: 'payments', audienceSize: 6000, website: 'https://payexpo.com' },
  { name: 'Seamless Middle East', date: '2026-05-12', endDate: '2026-05-13', city: 'Dubai', country: 'UAE', vertical: 'payments', audienceSize: 8000, website: 'https://seamless-expo.com' },
  { name: 'FinTech Connect', date: '2026-11-23', endDate: '2026-11-24', city: 'London', country: 'UK', vertical: 'fintech', audienceSize: 5000, website: 'https://fintechconnect.com' },
  { name: 'EuroFinance', date: '2026-10-07', endDate: '2026-10-09', city: 'Vienna', country: 'Austria', vertical: 'fx', audienceSize: 3500, website: 'https://eurofinance.com' },
  { name: 'AFP Annual Conference', date: '2026-10-18', endDate: '2026-10-21', city: 'Nashville', country: 'USA', vertical: 'treasury', audienceSize: 7000, website: 'https://afponline.org' },
  { name: 'BAFT Global Annual Conference', date: '2026-03-16', endDate: '2026-03-18', city: 'Washington DC', country: 'USA', vertical: 'fx', audienceSize: 1500, website: 'https://baft.org' },
  { name: 'Singapore Fintech Festival', date: '2026-11-04', endDate: '2026-11-06', city: 'Singapore', country: 'Singapore', vertical: 'fintech', audienceSize: 60000, website: 'https://fintechfestival.sg' },
  { name: 'Fintech Nexus USA', date: '2026-05-20', endDate: '2026-05-21', city: 'New York', country: 'USA', vertical: 'fintech', audienceSize: 3000, website: 'https://fintechnexus.com' },
  { name: 'Merchant Payments Ecosystem (MPE)', date: '2026-02-17', endDate: '2026-02-19', city: 'Berlin', country: 'Germany', vertical: 'payments', audienceSize: 1200, website: 'https://merchantpaymentsecosystem.com' },
  { name: 'SWIFT Business Forum London', date: '2026-04-09', endDate: '2026-04-09', city: 'London', country: 'UK', vertical: 'fx', audienceSize: 1000, website: 'https://swift.com' },
  { name: 'Currency Research Americas', date: '2026-04-06', endDate: '2026-04-08', city: 'Miami', country: 'USA', vertical: 'fx', audienceSize: 600, website: 'https://currencyresearch.com' },
  { name: 'Currency Research Europe', date: '2026-09-21', endDate: '2026-09-23', city: 'Copenhagen', country: 'Denmark', vertical: 'fx', audienceSize: 500, website: 'https://currencyresearch.com' },
  { name: 'Seamless Asia', date: '2026-09-02', endDate: '2026-09-03', city: 'Bangkok', country: 'Thailand', vertical: 'payments', audienceSize: 5000, website: 'https://seamless-expo.com/asia' },
  { name: 'TransferTo World Connect', date: '2026-06-17', endDate: '2026-06-19', city: 'Dubai', country: 'UAE', vertical: 'payments', audienceSize: 800, website: 'https://transferto.com' },
  { name: 'WIRED Money', date: '2026-06-24', endDate: '2026-06-24', city: 'London', country: 'UK', vertical: 'fintech', audienceSize: 1500, website: 'https://wired.co.uk/money' },
  { name: 'FinovateFall Europe', date: '2026-11-17', endDate: '2026-11-18', city: 'Berlin', country: 'Germany', vertical: 'fintech', audienceSize: 2000, website: 'https://finovate.com' },
  { name: 'Global Travel Forum', date: '2026-03-03', endDate: '2026-03-04', city: 'Barcelona', country: 'Spain', vertical: 'travel', audienceSize: 4000, website: 'https://globaltravelforum.com' },
  { name: 'ITB Berlin', date: '2026-03-03', endDate: '2026-03-07', city: 'Berlin', country: 'Germany', vertical: 'travel', audienceSize: 100000, website: 'https://itb.com' },
  { name: 'ATPCO Elevate', date: '2026-05-06', endDate: '2026-05-07', city: 'Washington DC', country: 'USA', vertical: 'travel', audienceSize: 900, website: 'https://atpco.net' },
  { name: 'Bankex', date: '2026-05-13', endDate: '2026-05-14', city: 'Warsaw', country: 'Poland', vertical: 'fintech', audienceSize: 2000, website: 'https://bankex.pl' },
  { name: 'iFX EXPO International', date: '2026-01-13', endDate: '2026-01-15', city: 'Limassol', country: 'Cyprus', vertical: 'fx', audienceSize: 4000, website: 'https://ifxexpo.com' },
  { name: 'iFX EXPO Asia', date: '2026-07-21', endDate: '2026-07-23', city: 'Bangkok', country: 'Thailand', vertical: 'fx', audienceSize: 3500, website: 'https://ifxexpo.com/asia' },
  { name: 'Payments Leaders Summit', date: '2026-09-15', endDate: '2026-09-16', city: 'London', country: 'UK', vertical: 'payments', audienceSize: 400, website: 'https://paymentleaderssummit.com' },
  { name: 'PAY360', date: '2026-03-24', endDate: '2026-03-25', city: 'London', country: 'UK', vertical: 'payments', audienceSize: 5000, website: 'https://pay360.com' },
  { name: 'FX Week Europe', date: '2026-06-08', endDate: '2026-06-09', city: 'London', country: 'UK', vertical: 'fx', audienceSize: 1200, website: 'https://fxweek.com' },
]

async function main() {
  console.log('Seeding 30 conferences...')
  await prisma.conference.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.contact.deleteMany()

  for (const c of conferences) {
    const icpScore = computeScore({
      vertical: c.vertical,
      audienceSize: c.audienceSize,
      country: c.country,
      city: c.city,
    })
    const tier = icpScore >= 80 ? 'A' : icpScore >= 60 ? 'B' : 'C'

    await prisma.conference.create({
      data: {
        name: c.name,
        date: new Date(c.date),
        endDate: c.endDate ? new Date(c.endDate) : null,
        city: c.city,
        country: c.country,
        vertical: c.vertical,
        audienceSize: c.audienceSize,
        website: c.website ?? null,
        icpScore,
        tier,
      },
    })
  }
  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
