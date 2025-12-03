export function validarCedula(cedula: string): boolean {
  // 1. Debe tener 10 dígitos
  if (cedula.length !== 10) return false;

  // 2. Debe ser solo números
  const digits = cedula.split("").map(Number);
  if (digits.some(isNaN)) return false;

  // 3. Código de provincia (01-24)
  const provincia = digits[0] * 10 + digits[1];
  if (provincia < 1 || provincia > 24) return false;

  // 4. Tercer dígito menor a 6 (Personas naturales)
  if (digits[2] >= 6) return false;

  // 5. Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = digits[i] * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = digits[9];
  const decenaSuperior = Math.ceil(suma / 10) * 10;
  let resultado = decenaSuperior - suma;

  if (resultado === 10) resultado = 0;

  return resultado === digitoVerificador;
}
