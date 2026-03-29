document.addEventListener('DOMContentLoaded', () => {
    const binInput = document.getElementById('binInput');
    const amountInput = document.getElementById('amountInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputArea = document.getElementById('outputArea');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Generate BINs
    async function generate() {
        const bin = binInput.value.trim();
        const amount = amountInput.value || 10;

        if (!bin) {
            alert('Please enter a BIN prefix first!');
            return;
        }

        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        outputArea.value = 'Generating... High Performance Engine Initialized...';

        try {
            const response = await fetch(`/api/gen?bin=${encodeURIComponent(bin)}&amount=${amount}`);
            const result = await response.json();

            if (result.error) {
                outputArea.value = `Error: ${result.error}`;
            } else {
                outputArea.value = result.data.join('\n');
            }
        } catch (error) {
            outputArea.value = 'Error: Failed to connect to the generation engine.';
            console.error(error);
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    }

    // Copy to clipboard
    function copyAll() {
        if (!outputArea.value || outputArea.value.startsWith('Error')) return;
        
        outputArea.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.innerText;
        copyBtn.innerText = '✅ Copied!';
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    }

    // Download as TXT
    function downloadTxt() {
        const text = outputArea.value;
        if (!text || text.startsWith('Error')) return;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bin_gen_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event Listeners
    generateBtn.addEventListener('click', generate);
    copyBtn.addEventListener('click', copyAll);
    downloadBtn.addEventListener('click', downloadTxt);

    // Enter key to generate
    binInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generate();
        }
    });
});
