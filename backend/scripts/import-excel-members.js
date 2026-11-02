const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../src/config/db');

// Raw CSV text from the user
const rawCsv = `User ID,First name,Last name,Email,Phone,Home Street,Home City,Home State,Home Zip,Privacy Policy,Membership Expiration date,Nickname,Company Name,Company Street,Company City,Company State,Company Zip Code,Company Phone,Board Position,Password,Job Title,SEG Status,Group participation,Member Type,University 1,Degree 1,Major 1,Year Graduated 1,University 2,Degree 2,Major 2,Year Graduated 2,University 3,Degree 3,Major 3,Year Graduated 3,TGS Member,Archived,Subscribed to emails,Subscription source,Opted in,Event announcements,Member emails and newsletters,Administration access,Created on,Profile last updated,Last login,Updated by,Balance,Total donated,Membership enabled,Membership level,Membership status,Member since,Renewal due,Renewal date last changed,Level last changed,Access to profile by others,Details to show,Photo albums enabled,Member bundle ID or email,Member role,Member renewal type,Notes
51307957,Steven,Roche,slroche314@gmail.com,918 606-7236,1762 newman place,carson city,NV,89703,Yes,2018-06-30,Steve,Geophysical Consultant,1762 newman place,Carson City,NV,89703,918 606-7236,Director of Wandering and Wondering,,Geophysicist,Active,Board Members,,Colorado School of Mines,Ph.D.,Geophysics,1997-06-01,University of California Riverside,Bachelors,Geophysics,1978-06-01,,,,,no,no,yes,,,yes,yes,,2019-07-02,2023-07-27,2026-08-31 13:47:54,51307693,0.00,500.00,yes,Member,Active,2019-08-16,2027-08-01,2026-07-02,2019-08-15,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
51307693,Shannon,Jeffries,snb928@gmail.com,918-939-9377,10857 251st St,Beggs,Ok,74421,Yes,2018-06-30,,"Jeffries Geophysical Consulting, LLC",10857 251st ST,Beggs,OK,74421,9189399377,Webmaster,,Owner,Active,Board Members,,Oklahoma State University,Masters,Geology,2011-05-31,Missouri State University,Bachelors,Geology,,,,,,no,no,yes,,,yes,yes,Account administrator (Full access),2019-07-02,2026-08-31,2026-09-29 13:07:50,51307693,0.00,250.00,yes,Member,Active,2026-08-31,2027-08-01,2026-08-31,2019-08-16,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
51307744,Doug,Klepacki,dklepacki@coterra.com,,202 S. Cheyenne AveSte. 1500,Tulsa,Oklahoma,74104,No,2090-01-01,,Coterra Energy,,,,,,,,,,,,,,,,,,,,,,,,,no,no,,,no,no,,2019-07-02,2023-09-01,2021-01-28 09:08:34,51307957,0.00,0.00,yes,Corporate Member,Active,2019-09-01,2020-08-01,,2019-09-01,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
51307949,Kenton,West,kw61fordpu@gmail.com,9185131785,2532 Williamsburg St.,Bartlesville,OK,74006,Yes,2019-06-30,Kent,retired,2532 Williamsburg St.,Bartlesville,OK,74006,918-513-1785,,,Retired,Active,,,fort hays state,Bachelors,geology,1976-05-31,New Mexico Institute of Mining and Technology,Masters,geophysics,1979-06-04,,,,,no,no,yes,,,yes,yes,,2019-07-02,2019-09-09,2026-09-09 08:37:21,,0.00,0.00,yes,Member,Active,2019-09-09,2027-08-01,2026-08-03,2019-09-06,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
51307914,Keith,Willson,keithwillsonreb@gmail.com,9182891926,8916 S Kingston Ave,Tulsa,Oklahoma,74137,Yes,2090-01-01,Keith,None,ns,n,na,ns,na,Advisor,,na,Active,Board Members,,Stanford University,Masters,Geophysics,1978-06-15,Stanford University,Bachelors,Physics,1978-06-15,,,,,no,no,yes,,,yes,yes,"Membership manager,Event manager,Donations manager,Newsletter manager,Online store manager",2019-07-02,2024-11-01,2026-08-31 12:44:12,61761524,-20.00,0.00,yes,Member,Active,2019-09-12,,2024-11-01,2019-09-11,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
51307871,Sherwin,Eskew,seskew2007@sbcglobal.net,,6490 Lindsay Drive,Sapulpa,OK,74066,No,2018-06-30,,WPX Energy,One Williams CenterrnP.O. Box 74172  MD 35,Tulsa,OK,74101-3102,918-576-8941,,,,,,,,,,,,,,,,,,,,no,yes,,,no,no,,2019-07-02,2019-10-10,2022-05-05 08:46:57,,0.00,0.00,yes,Honorary Member,Active,2019-10-10,,,2019-10-10,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
51307887,Phil,Lakin,phil@plxinc.us,918-704-0555,12445 S. 75th E. Ave.,Bixby,Oklahoma,74008,Yes,2019-06-30,Phil,"PLX, Inc",12445 S. 75th E. Ave.,Bixby,Ok,74008,9187040555,na,,President,Emeritus,,,Texas Western,Bachelors,Physics,1966-01-06,,,,,,,,,yes,no,yes,,,yes,yes,,2019-07-02,2026-07-02,2026-09-09 12:31:15,51307887,0.00,0.00,yes,Member,Active,2021-09-13,2027-08-01,2026-07-02,2019-11-05,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
51307694,William,Manthey,wmcmanthey@gmail.com,(405) 205-5290,8200 NW 82nd Street,Oklahoma City,OK,73132,Yes,2019-06-30,Bill,"AURORA ENERGY & TECHNOLOGY, LLC",8200 NW 82nd Street,Oklahoma City,OK,73132,(405) 205-5290,Geophysicist/Geologist,,Geophysicist/Geologist,Active,,,Michigan Technological University,Bachelors,Geophysics,1975-05-15,,,,,,,,,no,no,yes,,,yes,yes,,2019-07-02,2020-01-08,2026-09-09 11:49:54,51307914,0.00,0.00,yes,Member,Active,2020-01-08,2027-08-01,2026-07-26,2019-12-22,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
53308882,Gary,Hoover,garyhoov@sbcglobal.net,918 397 0881,2919 Ridge Court,Bartlesville,Oklahoma,74006,Yes,,,Dawson Geopysical Company,"508 West Wall, Suite 800",Midland,Texas,79701,4326843000,,,Director,Emeritus,,,"University of Nebraska, Lincoln",Bachelors,Physics & Math,1961-08-01,"Kansas State University, Manhattan",Ph.D.,Physics,1968-08-01,,,,,no,no,yes,,,yes,yes,,2020-01-07,2020-01-07,2026-09-03 15:23:48,53308882,160.00,0.00,yes,Honorary Member,Active,2020-01-07,,,2020-01-07,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
53351038,Berton,Fisher,bfisher@lithochim.com,9185272332,3622 South Yorktown Avenue,Tulsa,OK,74105,Yes,,Bert,"Lithochimeia, LLC",3622 S. Yorktown Ave,Tulsa,US,74105,9185272332,None,,Managing Principal,Non-member,,,Yale University,Bachelors,Geology & Geophysics,1973-06-04,Case Western Reserve University,Masters,Earth Sciences,1976-08-25,Case Western Reserve University,Ph.D.,Earth Sciences,1979-01-10,yes,no,yes,,,yes,no,,2020-01-10,2024-10-24,2026-08-31 13:24:23,51307693,0.00,0.00,yes,Member,Active,2024-10-24,2027-08-01,2026-07-02,2020-01-10,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
51307884,Tammy,Campbell,tlcampb@yahoo.com,9182098045,10842 S 94TH EAST AVE,TULSA,Co,74133,Yes,2017-06-30,,Crescent Energy/Vital Energy,521 E 2nd St. Suite 900,Tulsa,OK,74120,918-858-5072,na,,Geoscience Manager,Active,,,Colorado School of Mines,Bachelors,Geophysical Engineering,1998-05-01,University of Tulsa,Masters,Energy Business,2024-05-17,,,,,yes,no,yes,,,yes,yes,,2019-07-02,2021-09-13,2026-07-02 08:36:31,51307957,0.00,0.00,yes,Member,Active,2021-09-13,2027-08-01,2026-07-02,2021-06-16,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
51307923,Dennis,Langlois,dennis.langlois@tgs.com,17137036830,10451 Clay Road,Houston,TX,77041,Yes,2013-06-30,,TGS,10451 Clay Road,Houston,TX,77041,17137036830,Project Development and Sales,,Project Development and Sales,Active,,,URL,Bachelors,Everyday living,1979-06-29,,,,,,,,,yes,no,yes,,,yes,yes,,2019-07-02,2023-09-11,2024-01-10 03:41:36,51307923,0.00,1200.00,yes,Corporate Member,Active,2022-08-25,2023-08-01,2023-09-11,2021-08-31,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
61761524,Shantanu,Singh,shantanugst7@gmail.com,8327589238,12010 S Pittsburg Ave,Tulsa,OK,74137,Yes,,,CatSeis Consulting LLC,12010 S Pittsburg Ave,Tulsa,OK,74137,8327589238,Treasurer,,Geophysical consultant,Active,Board Members,,"Texas A&M University, College Station",Masters,Geophysics,2005-12-15,,,,,,,,,yes,no,yes,,,yes,yes,Account administrator (Full access),2021-09-29,2026-08-31,2026-09-04 14:31:22,51307693,0.00,,yes,Member,Active,2026-08-31,2027-08-01,2026-08-31,2021-09-29,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
69274216,Fred,Duffy,fredduffy@att.net,5124228827,411 N 84th Place,Broken Arrow,Oklahoma,74014,Yes,,Fred,retired,blank,blank,blank,blank,blank,blank,,blank,Non-member,,,CUNY,Bachelors,Geology,1975-05-15,Ball State University,Masters,Geology,1977-05-18,,,,,yes,no,yes,,,yes,yes,,2023-05-10,2023-10-26,2026-09-03 11:38:52,69274216,0.00,0.00,yes,Member,Active,2023-10-14,2027-08-01,2026-07-02,2023-05-10,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
70473976,John,McLeod,mcleod1999@gmail.com,9189260258,7928 South Quebec Avenue,TULSA,OK,74136,Yes,,,Source Rocks International,"321 South Boston Avenue, Suite 201",Tulsa,OK,74103,9189260258,Self,,Founder,Non-member,,,Northern Illinois University,Masters,Geology,1979-05-31,,,,,,,,,yes,no,yes,,,yes,yes,,2023-09-14,2023-11-09,2026-09-10 09:59:17,51307693,0.00,0.00,yes,Member,Active,2023-11-09,2027-08-01,2026-07-04,2023-11-02,yes,"Email&&Anybody",no,,Individual,Manual,"Membership approved"
73498655,Magnolia,McLaughlin,magnolia.mclaughlin@okstate.edu,4046155004,PO Box 721322,Oklahoma City,Oklahoma,73172,Yes,,,Oklahoma State University,105 Noble Research Ctr,Stillwater,Oklahoma,74078,(405) 744-6358,n/a,,Graduate Student,Student,,,Oklahoma State University,Ph.D.,Geology,2026-12-18,Georgia State University,Masters,Geosciences,2023-12-15,Georgia State University,Bachelors,Geosciences,2023-12-15,no,no,yes,,,yes,yes,,2024-02-27,2025-10-14,2024-12-04 05:06:00,51307693,0.00,0.00,yes,Student Membership,Active,2025-10-14,2025-02-27,,2024-02-27,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
78977983,John,Hooper,johnmhooper@gmail.com,4054088367,4805 Crystal Lake Rd,Norman,Oklahoma,73072,Yes,,,PetroSEIS L.P.,4805 Crystal Lake Rd,Norman,Oklahoma,73072,4054088367,Chair,,Managing Partner,Active,,,Iowa State University,Bachelors,Geology,1974-02-01,Iowa State University,Masters,Geology,1978-08-01,,,,,no,no,yes,,,yes,yes,,2025-02-06,2025-09-18,2026-01-14 07:43:03,51307693,0.00,0.00,yes,Member,Active,2025-09-18,2025-08-01,,2025-02-06,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"
95865734,William,Benzing,cancerout@ymail.com,9182025713,"5126 S Wheeling Ave, Apt 107",Tulsa,Oklahoma,74105,Yes,,,Spartan College of Aeronautics and Technology,8820 East Pine Street,Tulsa,Oklahoma,74115,9188315313,none,,Adjunct Physics Teacher,Non-member,,,University of Hawaii,Bachelors,Geoscience,1969-04-16,University of Chicago,Ph.D.,Geophysical Sciences,1974-05-15,,,,,no,no,yes,,,yes,yes,,2025-12-12,2025-12-31,2026-07-08 09:43:15,51307693,0.00,0.00,yes,Member,Active,2025-12-31,2027-08-01,2026-07-08,2025-12-12,yes,"Email&&Anybody",yes,,Individual,Manual,"Membership approved"`;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCsvLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => {
      obj[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    rows.push(obj);
  }
  return rows;
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

async function runImport() {
  console.log('Starting member import from Excel dataset...');
  const rows = parseCsv(rawCsv);
  console.log(`Found ${rows.length} member rows to process.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const r of rows) {
    const memberId = r['User ID'];
    const firstName = r['First name'];
    const lastName = r['Last name'];
    const email = (r['Email'] || '').toLowerCase().trim();
    if (!email) {
      console.warn(`Skipping row without email: ${firstName} ${lastName}`);
      continue;
    }

    const nickname = r['Nickname'] || null;
    const phone = r['Phone'] || null;
    const homeStreet = r['Home Street'] || null;
    const homeCity = r['Home City'] || null;
    const homeState = r['Home State'] || null;
    const homeZip = r['Home Zip'] || null;

    const privacyPolicy = (r['Privacy Policy'] || '').toLowerCase() === 'yes' ? 1 : 0;
    const eventAnnouncements = (r['Event announcements'] || '').toLowerCase() === 'yes' ? 1 : 0;
    const newsletterOptIn = (r['Member emails and newsletters'] || r['Subscribed to emails'] || '').toLowerCase() === 'yes' ? 1 : 0;
    const directoryVisible = (r['Access to profile by others'] || '').toLowerCase() === 'yes' ? 1 : 0;

    const companyName = r['Company Name'] || null;
    const companyStreet = r['Company Street'] || null;
    const companyCity = r['Company City'] || null;
    const companyState = r['Company State'] || null;
    const companyZip = r['Company Zip Code'] || null;
    const companyPhone = r['Company Phone'] || null;

    const boardPos = r['Board Position'] || '';
    const boardPosition = (!boardPos || ['none', 'na', 'n/a', 'blank'].includes(boardPos.toLowerCase())) ? null : boardPos;
    const jobTitle = r['Job Title'] || null;

    // Determine executive status
    const groupPart = r['Group participation'] || '';
    const isExecutive = (groupPart.includes('Board Members') || (boardPosition && boardPosition.length > 2)) ? 1 : 0;

    // SEG Status
    let segStatus = (r['SEG Status'] || 'non-member').toLowerCase().trim();
    if (!['active', 'associate', 'emeritus', 'student', 'non-member'].includes(segStatus)) {
      segStatus = 'non-member';
    }

    const tgsMember = (r['TGS Member'] || '').toLowerCase() === 'yes' ? 1 : 0;

    // Membership Tier mapping
    const level = (r['Membership level'] || '').toLowerCase();
    let tier = 'professional';
    if (level.includes('student')) tier = 'student';
    else if (level.includes('corporate')) tier = 'corporate';
    else if (level.includes('honorary')) tier = 'professional';

    // Status & Expiration
    let status = (r['Membership status'] || 'active').toLowerCase().trim();
    if (!['active', 'pending', 'inactive', 'expired'].includes(status)) {
      status = 'active';
    }

    const renewalDue = r['Renewal due'] || r['Membership Expiration date'] || null;
    let expiresAt = null;
    if (renewalDue && renewalDue.match(/^\d{4}-\d{2}-\d{2}/)) {
      expiresAt = `${renewalDue.split('T')[0]} 23:59:59`;
      // Check if expired
      if (new Date(expiresAt) < new Date() && status === 'active') {
        status = 'expired';
      }
    }

    const memberSince = r['Member since'] || r['Created on'] || null;
    let joinedAt = null;
    if (memberSince && memberSince.match(/^\d{4}-\d{2}-\d{2}/)) {
      joinedAt = `${memberSince.split('T')[0]} 00:00:00`;
    }

    // Parse Education records (up to 3)
    const educationList = [];
    for (let num = 1; num <= 3; num++) {
      const u = r[`University ${num}`];
      const d = r[`Degree ${num}`];
      const m = r[`Major ${num}`];
      const y = r[`Year Graduated ${num}`];
      if (u || d || m) {
        educationList.push({
          university: u || '',
          degree: d || '',
          major: m || '',
          year: y ? y.slice(0, 4) : ''
        });
      }
    }
    const educationJson = educationList.length > 0 ? JSON.stringify(educationList) : null;
    const primaryEdu = educationList[0] || {};

    // Determine User Role
    const adminAccess = r['Administration access'] || '';
    let role = 'member';
    if (adminAccess.includes('Account administrator')) {
      role = 'admin';
    } else if (isExecutive) {
      role = 'executive';
    }

    // 1. Create or link user account in `users`
    let [userRows] = await db.execute('SELECT id, role FROM users WHERE email = ?', [email]);
    let userId = null;
    if (userRows.length === 0) {
      // Default password: GST@2026{first3}
      const defaultPw = `GST@2026${(firstName || 'Usr').slice(0, 3).toUpperCase()}`;
      const hash = await bcrypt.hash(defaultPw, 10);
      const [uRes] = await db.execute(
        'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
        [email, hash, role]
      );
      userId = uRes.insertId;
    } else {
      userId = userRows[0].id;
      // Upgrade role if higher privilege detected
      if (role === 'admin' && userRows[0].role !== 'admin') {
        await db.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
      } else if (role === 'executive' && userRows[0].role === 'member') {
        await db.execute('UPDATE users SET role = ? WHERE id = ?', ['executive', userId]);
      }
    }

    // 2. Insert or update member record in `members`
    const [existingMember] = await db.execute('SELECT id FROM members WHERE email = ?', [email]);
    if (existingMember.length === 0) {
      await db.execute(
        `INSERT INTO members
         (member_id, user_id, email, first_name, last_name, nickname, phone,
          home_street, home_city, home_state, home_zip,
          privacy_policy, event_announcements, newsletter_opt_in, directory_visible,
          company, company_name, company_street, company_city, company_state, company_zip, company_phone,
          board_position, job_title, seg_status,
          university, degree, major, education, tgs_member,
          tier, status, is_executive, joined_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, ?,
                 ?, ?, ?, ?,
                 ?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?,
                 ?, ?, ?, ?, ?,
                 ?, ?, ?, ?, ?)`,
        [
          memberId, userId, email, firstName, lastName, nickname, phone,
          homeStreet, homeCity, homeState, homeZip,
          privacyPolicy, eventAnnouncements, newsletterOptIn, directoryVisible,
          companyName, companyName, companyStreet, companyCity, companyState, companyZip, companyPhone,
          boardPosition, jobTitle, segStatus,
          primaryEdu.university || null, primaryEdu.degree || null, primaryEdu.major || null, educationJson, tgsMember,
          tier, status, isExecutive, joinedAt || new Date(), expiresAt
        ]
      );
      insertedCount++;
      console.log(`[+] Added: #${memberId} - ${firstName} ${lastName} (${email})`);
    } else {
      await db.execute(
        `UPDATE members SET
          member_id = ?, user_id = ?, first_name = ?, last_name = ?, nickname = ?, phone = ?,
          home_street = ?, home_city = ?, home_state = ?, home_zip = ?,
          privacy_policy = ?, event_announcements = ?, newsletter_opt_in = ?, directory_visible = ?,
          company = ?, company_name = ?, company_street = ?, company_city = ?, company_state = ?, company_zip = ?, company_phone = ?,
          board_position = ?, job_title = ?, seg_status = ?,
          university = ?, degree = ?, major = ?, education = ?, tgs_member = ?,
          tier = ?, status = ?, is_executive = ?,
          expires_at = COALESCE(?, expires_at)
         WHERE id = ?`,
        [
          memberId, userId, firstName, lastName, nickname, phone,
          homeStreet, homeCity, homeState, homeZip,
          privacyPolicy, eventAnnouncements, newsletterOptIn, directoryVisible,
          companyName, companyName, companyStreet, companyCity, companyState, companyZip, companyPhone,
          boardPosition, jobTitle, segStatus,
          primaryEdu.university || null, primaryEdu.degree || null, primaryEdu.major || null, educationJson, tgsMember,
          tier, status, isExecutive, expiresAt,
          existingMember[0].id
        ]
      );
      updatedCount++;
      console.log(`[*] Updated: #${memberId} - ${firstName} ${lastName} (${email})`);
    }
  }

  console.log(`\nImport complete! Inserted: ${insertedCount}, Updated: ${updatedCount}, Total: ${rows.length}`);
  process.exit(0);
}

runImport().catch(err => {
  console.error('Import failed with error:', err);
  process.exit(1);
});

