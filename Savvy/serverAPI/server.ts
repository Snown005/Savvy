import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API ключ (замініть на свій)
const OPENAI_API_KEY = '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';

// Types
interface ModerationRequest {
  text: string;
}

interface OpenAIModerationResponse {
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
}

interface ModerationResponse {
  flagged: boolean;
  categories: Record<string, boolean>;
  categoryScores: Record<string, number>;
}

// Endpoint для модерації
app.post('/api/moderate', async (req: Request<{}, {}, ModerationRequest>, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Текст не надано' });
    }

    // Запит до OpenAI Moderation API (використовуємо глобальний fetch)
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-moderation-latest'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API відповідь:', response.status, errorText);
      throw new Error(`OpenAI API помилка: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as OpenAIModerationResponse;
    const result = data.results[0];

    // Повернути результат
    const moderationResult: ModerationResponse = {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores
    };

    res.json(moderationResult);

  } catch (error) {
    console.error('Помилка модерації:', error);
    res.status(500).json({ 
      error: 'Помилка сервера', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Тестовий endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Moderation API Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});