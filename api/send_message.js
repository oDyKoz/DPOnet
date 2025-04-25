const sendMessage = async () => {
  if (!userMessage.trim()) {
    setError("Digite uma mensagem antes de enviar.");
    return;
  }

  try {
    const response = await fetch("/api/send_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.response || "Erro ao enviar mensagem");
    }

    setChatHistory(prev => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "bot", content: data.response }
    ]);
    setUserMessage("");
    setError(null);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    setError("Erro ao se comunicar com o servidor: " + error.message);
  }
};
