from transformers import T5Tokenizer, T5ForConditionalGeneration

model = T5ForConditionalGeneration.from_pretrained('t5-small')
tokenizer = T5Tokenizer.from_pretrained('t5-small')


def generate_summary(text):
    preprocess_text = text.strip().replace("\n", "")
    t5_prepared_Text = "summarize: " + preprocess_text
    tokenized_text = tokenizer.encode(t5_prepared_Text,
                                        return_tensors="pt",
                                        max_length=512,
                                        truncation=True,
                                        )
    summary_ids = model.generate(tokenized_text,
                                    num_beams=4,
                                    no_repeat_ngram_size=9,
                                    length_penalty=1.0,
                                    min_length=100,
                                    max_length=500,
                                    early_stopping=True
                                    )
    bertsummary = tokenizer.decode(summary_ids[0],
                                       skip_special_tokens=True)
    return bertsummary
