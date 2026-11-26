// Cria o primeiro administrador direto no banco.
// Uso: npm run criar-admin -- "Seu Nome" admin@repara.com suaSenha
// As variáveis vêm do .env.local (o script do package.json usa node --env-file, Node 20.6 ou mais novo).
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [nome, emailBruto, senha] = process.argv.slice(2);

if (!nome || !emailBruto || !senha) {
  console.log('Uso: npm run criar-admin -- "Seu Nome" email@exemplo.com senha');
  process.exit(1);
}
if (!emailBruto.includes("@")) {
  console.log("E-mail inválido.");
  process.exit(1);
}
if (senha.length < 6) {
  console.log("A senha precisa ter pelo menos 6 caracteres.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.log("MONGODB_URI não encontrada. Crie o arquivo .env.local a partir do .env.example.");
  process.exit(1);
}

const email = emailBruto.toLowerCase().trim();

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const usuarios = mongoose.connection.collection("usuarios");

  if (await usuarios.findOne({ email })) {
    console.log("Já existe um usuário com esse e-mail.");
    process.exitCode = 1;
  } else {
    await usuarios.insertOne({
      nome: nome.trim(),
      email,
      senhaHash: await bcrypt.hash(senha, 10),
      role: "admin",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Administrador criado: ${email}`);
  }
} catch (erro) {
  console.log("Não foi possível criar o administrador:", erro.message);
  console.log("Confira o MONGODB_URI e se o Atlas libera o seu IP (Network Access).");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
