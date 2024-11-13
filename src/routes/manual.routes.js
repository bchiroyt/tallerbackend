import { Router } from "express";
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/manual', (req, res) => {
  const manualPath = path.join(__dirname, '../../uploads/pdfs', 'ManualUsuario.pdf');
  res.download(manualPath, 'Manual_Usuario_Taller_Bicicletas.pdf');
});

export default router;