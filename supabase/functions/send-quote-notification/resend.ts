// Resend API client for Deno
export class Resend {
  private apiKey: string;
  private baseUrl = 'https://api.resend.com';

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    this.apiKey = apiKey;
  }

  emails() {
    return {
      send: async (options: {
        from: string;
        to: string;
        subject: string;
        text?: string;
        html?: string;
      }) => {
        const response = await fetch(`${this.baseUrl}/emails`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(options)
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: data };
        }

        return { data, error: null };
      }
    };
  }
}