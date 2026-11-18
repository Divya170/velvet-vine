import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

/** Shape every validation failure as { message, errors: { field: firstMessage } } so the frontend can show inline errors. */
export function fieldErrors(errors: Record<string, string>, message = 'Please check the highlighted fields.') {
  return new BadRequestException({ statusCode: 400, message, errors });
}

function flatten(errors: ValidationError[], parent = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of errors) {
    const key = parent ? `${parent}.${e.property}` : e.property;
    if (e.constraints) {
      const first = Object.values(e.constraints)[0];
      if (first) out[key] = String(first);
    }
    if (e.children?.length) Object.assign(out, flatten(e.children, key));
  }
  return out;
}

export function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    exceptionFactory: (errors) => fieldErrors(flatten(errors)),
  });
}
