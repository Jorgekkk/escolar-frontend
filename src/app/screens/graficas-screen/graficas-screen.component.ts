import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {


  public total_user: any = {};


  lineChartData: ChartData<'line'> = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [89, 34, 43, 54, 28, 74, 93],
        label: 'Registro de materias',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#F88406',
        fill: true,
      }
    ]
  };
  lineChartOption = { responsive: true };
  lineChartPlugins = [DatalabelsPlugin];



  barChartData: ChartData<'bar'> = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data: [34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  };
  barChartOption = { responsive: true };
  barChartPlugins = [DatalabelsPlugin];



  pieChartData: ChartData<'pie'> = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  };
  pieChartOption = { responsive: true };
  pieChartPlugins = [DatalabelsPlugin];



  doughnutChartData: ChartData<'doughnut'> = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  };
  doughnutChartOption = { responsive: true };
  doughnutChartPlugins = [DatalabelsPlugin];


  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);


        const admins = response.admins;
        const maestros = response.maestros;
        const alumnos = response.alumnos;


        this.pieChartData = {
          ...this.pieChartData,
          datasets: [
            {
              ...this.pieChartData.datasets[0],
              data: [admins, maestros, alumnos]
            }
          ]
        };


        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [
            {
              ...this.doughnutChartData.datasets[0],
              data: [admins, maestros, alumnos]
            }
          ]
        };

      }, (error) => {
        console.error("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }
}
