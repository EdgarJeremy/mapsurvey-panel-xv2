import React from 'react';
import { Button, Form, Grid, Header, Message, Segment, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import swal from 'sweetalert';
import { inspect } from '../services/utilities';
import { Public } from '../services/requests';
import Wait from '../components/Wait';

export default class Register extends React.Component {

    state = {
        loading: true,
        loadingText: 'Menghubungi server..',
        error: false
    }

    componentDidMount() {
        document.title = "Mendaftar | MapSurvey";
        let { history } = this.props;
        this._setLoading(true, 'Mengecek session..');
        Public.check().then((res) => {
            if (res.status) {
                history.push('/panel');
            } else {
                this._setLoading(false);
            }
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _showError() {
        this.setState({ error: true });
    }

    _onRegister(e) {
        let form = e.target;
        let data = inspect(form);
        this._setLoading(true);
        Public.register(data).then((res) => {
            if (res.status) {
                swal('Konfirmasi', 'Pendaftaran berhasil. Silahkan cek inbox email anda untuk langkah selanjutnya', 'success').then(() => this._setLoading(false));
                form.reset();
            } else {
                this._showError();
                this._setLoading(false);
            }
        });
    }

    render() {
        const { loading, loadingText, error } = this.state;

        return (
            <div>
                <Wait visible={loading} text={loadingText} />
                <div className='login-form'>
                    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                        <Grid.Column style={{ maxWidth: 450 }}>
                            <Header as='h2' color='blue' textAlign='center'>
                                Mendaftar | Mapsurvey
                            </Header>
                            <Form size='large' onSubmit={this._onRegister.bind(this)}>
                                <Segment stacked>
                                    <Form.Input required name="tenant_name" fluid icon="user" iconPosition="left" placeholder="Nama" />
                                    <Form.Input required name="tenant_company" fluid icon="building" iconPosition="left" placeholder="Perusahaan" />
                                    <Form.Input required name="tenant_email" fluid icon="at" iconPosition="left" placeholder="Email" />
                                    <Form.Field>
                                        <Input required name="tenant_phone" label="+62" labelPosition="left" fluid placeholder="Nomor Telefon" />
                                    </Form.Field>
                                    <Form.Input required name="tenant_address" fluid icon="map" iconPosition="left" placeholder="Alamat" />
                                    <Form.Input required type="number" name="site_quota" fluid icon="object group" iconPosition="left" placeholder="Jumlah jenis survey" />
                                    <Form.TextArea name="tenant_description" placeholder="Keterangan (Tujuan Penyewa)" />


                                    <Button color="blue" fluid size="large">Daftar</Button>
                                </Segment>
                            </Form>
                            {(error) && (
                                <Message error>
                                    Login tidak valid
                                </Message>
                            )}
                            <Message>
                                Sudah punya akun? <Link to="/">Masuk</Link>
                            </Message>
                            <Message>
                                Copyright &copy; {new Date().getFullYear()}
                            </Message>
                        </Grid.Column>
                    </Grid>
                </div>
            </div>
        )
    }

}