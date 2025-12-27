# Quick Reference: Using the Question Bank

## Adding Questions with Math Formulas

### In Question Text or Solution

1. Type your content in the editor
2. Click **"∫ Math"** button in toolbar
3. Enter LaTeX formula (e.g., `\frac{x^2}{2}` or `\int_0^1 x dx`)
4. Formula appears as rendered block
5. Double-click to edit formula later

### In Options (MCQ)

1. Each option has its own mini-editor
2. Type option text
3. Click **"∫ Math"** button for formulas
4. Mark correct answer with checkbox
5. Options automatically labeled A, B, C, D

## Common LaTeX Examples

### Fractions

```latex
\frac{numerator}{denominator}
```

Example: `\frac{x^2 + 1}{x - 1}`

### Integrals

```latex
\int_a^b f(x) dx
```

Example: `\int_0^{\pi} \sin(x) dx`

### Limits

```latex
\lim_{x \to a} f(x)
```

Example: `\lim_{n \to \infty} \frac{1}{n}`

### Summation

```latex
\sum_{i=1}^{n} i^2
```

### Square Root

```latex
\sqrt{expression}
```

Example: `\sqrt{x^2 + y^2}`

### Superscript & Subscript

```latex
x^2    (superscript)
x_i    (subscript)
```

### Greek Letters

```latex
\alpha, \beta, \gamma, \delta, \theta, \pi, \sigma
```

### Vectors

```latex
\vec{v} = 3\hat{i} + 4\hat{j}
```

## Viewing Questions

### Question List

- All questions show rendered HTML
- Math formulas display properly
- Click **Eye icon** to view full details

### Question Detail

- Full question with formatting
- All options rendered with HTML
- Correct answers highlighted in green
- Solution with all formatting

## Tips

1. **Preview**: Math renders instantly after entering LaTeX
2. **Editing**: Double-click rendered formula to edit
3. **Validation**: Form won't submit if options are empty
4. **Options**: Minimum 2 options, at least 1 must be correct
5. **HTML**: All content stored as HTML, renders automatically

## Troubleshooting

### Formula Not Rendering

- Check LaTeX syntax
- Ensure formula is in math block (use ∫ Math button)
- Check browser console for errors

### Option Empty Error

- Make sure option has text content
- HTML tags alone don't count as content
- Add at least some text or formula

### Question Won't Save

- Check all required fields (subject, chapter, difficulty)
- Ensure question and solution have content
- For MCQ: check correct answer is marked
- For integer/numerical: enter valid number

## Keyboard Shortcuts (in editor)

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo
