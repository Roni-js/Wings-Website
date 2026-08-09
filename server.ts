import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';

const PORT = 3000;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1s9oMgn_zTWryP0n34z-FMKHg-dktQR6Nm-ZSO97AMVY';
const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

const LEADS_FILE = path.join(process.cwd(), 'leads.json');

// Ensure leads.json exists
function getStoredLeads(): any[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading leads file:', err);
  }
  return [];
}

function saveLeadLocally(leadData: any) {
  try {
    const leads = getStoredLeads();
    leads.push(leadData);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving lead locally:', err);
  }
}

// Initialize Google Auth with Service Account or keyFile
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

function getGoogleAuth() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  if (fs.existsSync(CREDENTIALS_PATH)) {
    return new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  return new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

let headersInitialized = false;

async function ensureSheetHeaders(sheetsInstance: any) {
  if (headersInitialized) return;
  try {
    const res = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1:Z1',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0 || rows[0].length === 0) {
      const headers = [
        'Timestamp',
        'Full Name',
        'Email Address',
        'Phone Number',
        'Brand / Website',
        'Monthly Ad Spend / Budget',
        'Requested Service',
        'Preferred Date',
        'Preferred Time',
        'Strategy Notes / Message',
        'Lead Source',
      ];
      await sheetsInstance.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
      console.log('Successfully added column headers to Google Sheet');
    }
    headersInitialized = true;
  } catch (err: any) {
    console.warn('Sheet header check note:', err?.message || err);
  }
}

async function appendToGoogleSheet(values: (string | number)[][]) {
  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    await ensureSheetHeaders(sheets);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });

    console.log('Successfully appended row to Google Sheet');
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error appending row to Google Sheet:', error?.message || error);
    throw error;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Book Your Free Strategy Call Submission
  app.post('/api/strategy-call', async (req, res) => {
    try {
      const {
        fullName = '',
        email = '',
        phone = '',
        brandName = '',
        websiteUrl = '',
        monthlySpend = '',
        service = '',
        preferredDate = '',
        preferredTime = '',
        notes = '',
      } = req.body || {};

      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
      });

      const leadId = `STRAT-${Date.now()}`;

      const leadRecord = {
        id: leadId,
        type: 'Strategy Call Form',
        timestamp,
        fullName,
        email,
        phone,
        brandName: brandName || websiteUrl,
        websiteUrl,
        monthlySpend,
        service,
        preferredDate,
        preferredTime,
        notes,
      };

      // 1. Always save lead locally first
      saveLeadLocally(leadRecord);

      // 2. Format row for Google Sheets
      const row = [
        timestamp,
        fullName,
        email,
        phone,
        brandName || websiteUrl,
        monthlySpend,
        service,
        preferredDate,
        preferredTime,
        notes,
        'Strategy Call Form',
      ];

      // 3. Gracefully attempt Google Sheets append
      const sheetResult = await appendToGoogleSheet([row]);

      res.status(200).json({
        success: true,
        message: 'Strategy call request recorded successfully!',
        leadId,
        sheetSynced: sheetResult.success,
        sheetNote: sheetResult.success
          ? 'Row added to Google Sheet'
          : 'Saved locally; Google Sheets API needs to be enabled in Cloud Console',
      });
    } catch (error: any) {
      console.error('Failed to submit strategy call lead:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to record lead.',
      });
    }
  });

  // API Route: General Contact Modal Submission
  app.post('/api/contact', async (req, res) => {
    try {
      const {
        name = '',
        email = '',
        phone = '',
        website = '',
        services = [],
        budget = '',
        message = '',
      } = req.body || {};

      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
      });

      const leadId = `CONTACT-${Date.now()}`;
      const servicesString = Array.isArray(services) ? services.join(', ') : String(services);

      const leadRecord = {
        id: leadId,
        type: 'Contact Modal Form',
        timestamp,
        name,
        email,
        phone,
        website,
        budget,
        services: servicesString,
        message,
      };

      // 1. Save lead locally
      saveLeadLocally(leadRecord);

      // 2. Format row for Google Sheets
      const row = [
        timestamp,
        name,
        email,
        phone,
        website,
        budget,
        servicesString,
        'N/A',
        'N/A',
        message,
        'Contact Modal Form',
      ];

      // 3. Gracefully attempt Google Sheets append
      const sheetResult = await appendToGoogleSheet([row]);

      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully!',
        leadId,
        sheetSynced: sheetResult.success,
      });
    } catch (error: any) {
      console.error('Failed to submit contact lead:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to record contact lead.',
      });
    }
  });

  // Admin API Route: Retrieve all captured leads
  app.get('/api/leads', (req, res) => {
    const leads = getStoredLeads();
    res.json({
      total: leads.length,
      spreadsheetId: SPREADSHEET_ID,
      leads,
    });
  });

  // Admin API Route: Export leads as CSV
  app.get('/api/leads/export-csv', (req, res) => {
    const leads = getStoredLeads();
    const headers = [
      'Timestamp',
      'Lead Type',
      'Name',
      'Email',
      'Phone',
      'Brand / Website',
      'Monthly Spend / Budget',
      'Services Required',
      'Preferred Date',
      'Preferred Time',
      'Notes / Message',
    ];

    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const values = [
        lead.timestamp || '',
        lead.type || '',
        lead.fullName || lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.brandName || lead.websiteUrl || lead.website || '',
        lead.monthlySpend || lead.budget || '',
        lead.service || lead.services || '',
        lead.preferredDate || '',
        lead.preferredTime || '',
        (lead.notes || lead.message || '').replace(/"/g, '""'),
      ].map((v) => `"${v}"`);

      csvRows.push(values.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="wings_marketing_leads.csv"');
    res.status(200).send(csvRows.join('\n'));
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', spreadsheetId: SPREADSHEET_ID, totalLeads: getStoredLeads().length });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

