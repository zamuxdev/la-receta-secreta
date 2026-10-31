using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Tests;

[Collection("Api")]
public class AuthPruebas(ApiDePrueba api) : PruebaDeApi(api)
{
    [Fact]
    public async Task Registro_crea_la_cuenta_con_el_correo_en_minusculas()
    {
        var correo = $"Alex.{Guid.NewGuid():N}@Correo.com";
        var respuesta = await Anonimo().PostAsJsonAsync("/api/auth/registro", new RegistroCrear("Alex", correo, Password));

        Assert.Equal(HttpStatusCode.Created, respuesta.StatusCode);
        var usuario = await respuesta.Content.ReadFromJsonAsync<UsuarioDto>();
        Assert.Equal(correo.ToLowerInvariant(), usuario!.Correo);
        Assert.Equal("Usuario", usuario.Rol);
    }

    [Fact]
    public async Task Registro_con_un_correo_repetido_responde_409()
    {
        var correo = $"{Guid.NewGuid():N}@correo.com";
        await Anonimo().PostAsJsonAsync("/api/auth/registro", new RegistroCrear("Uno", correo, Password));

        var respuesta = await Anonimo().PostAsJsonAsync("/api/auth/registro", new RegistroCrear("Dos", correo.ToUpperInvariant(), Password));

        Assert.Equal(HttpStatusCode.Conflict, respuesta.StatusCode);
    }

    [Fact]
    public async Task Registro_con_datos_invalidos_da_un_mensaje_por_campo()
    {
        var respuesta = await Anonimo().PostAsJsonAsync("/api/auth/registro", new RegistroCrear("", "no-es-correo", "corta"));

        var errores = await Errores(respuesta);
        Assert.Equal(["correo", "nombre", "password"], errores.Keys.Order());
        Assert.Equal("La contraseña debe tener al menos 8 caracteres.", errores["password"].Single());
    }

    [Fact]
    public async Task Login_con_contrasena_incorrecta_responde_401_con_mensaje_generico()
    {
        var correo = $"{Guid.NewGuid():N}@correo.com";
        await Anonimo().PostAsJsonAsync("/api/auth/registro", new RegistroCrear("Alex", correo, Password));

        var malaContrasena = await Anonimo().PostAsJsonAsync("/api/auth/login", new LoginCrear(correo, "otra-contrasena"));
        var correoInexistente = await Anonimo().PostAsJsonAsync("/api/auth/login", new LoginCrear("nadie@correo.com", Password));

        Assert.Equal(HttpStatusCode.Unauthorized, malaContrasena.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, correoInexistente.StatusCode);
        // El mismo mensaje en los dos casos, para no revelar qué correos existen.
        Assert.Equal("Correo o contraseña incorrectos.", await Detalle(malaContrasena));
        Assert.Equal(await Detalle(malaContrasena), await Detalle(correoInexistente));
    }

    [Fact]
    public async Task Yo_devuelve_el_usuario_del_token()
    {
        var cliente = await UsuarioNuevo("Bea");

        var usuario = await cliente.GetFromJsonAsync<UsuarioDto>("/api/auth/yo");

        Assert.Equal("Bea", usuario!.Nombre);
    }

    [Fact]
    public async Task Yo_sin_token_o_con_token_falso_responde_401()
    {
        var conTokenFalso = Anonimo();
        conTokenFalso.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "no.es.token");

        Assert.Equal(HttpStatusCode.Unauthorized, (await Anonimo().GetAsync("/api/auth/yo")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await conTokenFalso.GetAsync("/api/auth/yo")).StatusCode);
    }

    [Fact]
    public async Task Con_el_registro_cerrado_responde_403_y_las_cuentas_precargadas_pueden_entrar()
    {
        // Otra API sobre la misma base, configurada como el servidor publicado.
        // El correo de la lista va con mayúsculas y repetido para revisar que se normaliza y no se duplica.
        var correo = $"Maestra.{Guid.NewGuid():N}@Escuela.mx";
        using var publicada = ApiConConfiguracion(new()
        {
            ["Registro:Abierto"] = "false",
            ["CuentasIniciales:0:Nombre"] = "Maestra",
            ["CuentasIniciales:0:Correo"] = correo,
            ["CuentasIniciales:0:Password"] = Password,
            ["CuentasIniciales:1:Nombre"] = "Maestra repetida",
            ["CuentasIniciales:1:Correo"] = correo.ToLowerInvariant(),
            ["CuentasIniciales:1:Password"] = "otra-contrasena-larga",
        });
        var cliente = publicada.CreateClient();

        var registro = await cliente.PostAsJsonAsync("/api/auth/registro", new RegistroCrear("Intruso", $"{Guid.NewGuid():N}@correo.com", Password));
        var login = await cliente.PostAsJsonAsync("/api/auth/login", new LoginCrear(correo, Password));

        Assert.Equal(HttpStatusCode.Forbidden, registro.StatusCode);
        Assert.Equal("El registro de cuentas está cerrado. Pide tu cuenta a quien administra el sitio.", await Detalle(registro));
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var sesion = await login.Content.ReadFromJsonAsync<LoginRespuesta>();
        Assert.Equal("Maestra", sesion!.Usuario.Nombre);
        Assert.Equal(correo.ToLowerInvariant(), sesion.Usuario.Correo);
    }
}
