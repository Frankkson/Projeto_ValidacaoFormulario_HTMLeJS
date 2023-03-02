export function valida(input) {
	const tipoDeInput = input.dataset.tipo;

	if (validadores[tipoDeInput]) {
		validadores[tipoDeInput](input);
	}

	if (input.validity.valid) {
		input.parentElement.classList.remove("input-container--invalido");
		input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
	} else {
		input.parentElement.classList.add("input-container--invalido");
		input.parentElement.querySelector(".input-mensagem-erro").innerHTML =
			mostraMensagemDeErro(tipoDeInput, input);
	}
}
const tiposDeErro = [
	"customError",
	"patternMismatch",
	"typeMismatch",
	"valueMissing",
];

const mensagensDeErro = {
	cep: {
		customError: "Não foi possível encontrar o CEP digitado.",
		patternMismatch: "O CEP digitado não é válido.",
		valueMissing: "O campo de CEP não pode estar vazio.",
	},
	cpf: {
		customError: "O CPF digitado não é válido.",
		valueMissing: "O campo de CPF não pode estar vazio.",
	},
	cidade: {
		valueMissing: "O campo de cidade não pode estar vazio.",
	},
	dataNascimento: {
		customError: "Você deve ser maior que 18 anos para se cadastrar.",
		valueMissing: "O campo de data de nascimento não pode estar vazio.",
	},
	email: {
		typeMismatch: "O email digitado não é válido.",
		valueMissing: "O campo de email não pode estar vazio.",
	},
	estado: {
		valueMissing: "O campo de estado não pode estar vazio.",
	},
	logradouro: {
		valueMissing: "O campo de logradouro não pode estar vazio.",
	},
	nome: {
		valueMissing: "O campo de nome não pode estar vazio.",
	},
	preco: {
		valueMissing: "O campo de preço não pode estar vazio.",
	},
	senha: {
		patternMismatch:
			"A senha deve conter entre 6 e 12 caracteres, conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
		valueMissing: "O campo de senha não pode estar vazio.",
	},
};

const validadores = {
	cep: (input) => recuperarCEP(input),
	cpf: (input) => validaCPF(input),
	dataNascimento: (input) => validaDataNascimento(input),
};

function mostraMensagemDeErro(tipoDeInput, input) {
	let mensagem = "";

	tiposDeErro.forEach((erro) => {
		if (input.validity[erro]) {
			mensagem = mensagensDeErro[tipoDeInput][erro];
		}
	});

	return mensagem;
}

function validaDataNascimento(input) {
	const dataRecebida = new Date(input.value);
	let mensagem = "";

	if (!maiorQue18(dataRecebida)) {
		mensagem = "Você deve ser maior que 18 anos para se cadastrar.";
	}

	input.setCustomValidity(mensagem);
}

function maiorQue18(data) {
	const dataAtual = new Date();
	const dataMais18 = new Date(
		data.getUTCFullYear() + 18,
		data.getUTCMonth(),
		data.getUTCDate()
	);

	return dataMais18 <= dataAtual;
}

function validaCPF(input) {
	const cpfFormatado = input.value.replace(/\D/g, "");
	let mensagem = "";

	if (!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
		mensagem = "CPF inválido.";
	}

	input.setCustomValidity(mensagem);
}

function checaCPFRepetido(cpf) {
	const valoresRepetidos = [
		"00000000000",
		"11111111111",
		"22222222222",
		"33333333333",
		"44444444444",
		"55555555555",
		"66666666666",
		"77777777777",
		"88888888888",
		"99999999999",
	];
	let cpfValido = true;

	valoresRepetidos.forEach((valor) => {
		if (valor == cpf) {
			cpfValido = false;
		}
	});

	return cpfValido;
}

function checaEstruturaCPF(cpf) {
	const multiplicador = 10;

	return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
	if (multiplicador >= 12) {
		return true;
	}

	let multiplicadorInicial = multiplicador;
	let soma = 0;
	const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split("");
	const digitoVerificador = cpf.charAt(multiplicador - 1);

	for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
		soma = soma + cpfSemDigitos[contador] * multiplicadorInicial;
		contador++;
	}

	if (digitoVerificador == confirmaDigito(soma)) {
		return checaDigitoVerificador(cpf, multiplicador + 1);
	}

	return false;
}

function confirmaDigito(soma) {
	return 11 - (soma % 11);
}
//Verificar código de valicação de CPF

function recuperarCEP(input) {
	const cep = input.value.replace(/\D/g, "");
	const url = `https://viacep.com.br/ws/${cep}/json/`;
	const options = {
		method: "GET",
		mode: "cors",
		headers: {
			"content-type": "application/json;charset=utf-8",
		},
	};

	if (!input.validity.patternMismatch && !input.validity.valueMissing) {
		fetch(url, options)
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					input.setCustomValidity("Não foi possível encontrar o CEP digitado");
					return;
				}
				input.setCustomValidity("");
				preencherCamposEndereco(data);
				return;
			});
	}
}

function preencherCamposEndereco(data) {
	const cidade = document.querySelector('[data-tipo="cidade"]');
	const estado = document.querySelector('[data-tipo="estado"]');
	const logradouro = document.querySelector('[data-tipo="logradouro"]');

	cidade.value = data.localidade;
	estado.value = data.uf;
	logradouro.value = data.logradouro;
}
