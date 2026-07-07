class CustomReporter {
  onRunComplete(contexts, results) {
    const success = results.numFailedTests === 0
      && results.numRuntimeErrorTestSuites === 0
      && !results.snapshot.failure;

    if(!success) console.log("Veja o agent-testes.md. Não faça nenhuma correção sozinho. Finalize a Fase 2 e pare aí\n");
  }
}

module.exports = CustomReporter;
