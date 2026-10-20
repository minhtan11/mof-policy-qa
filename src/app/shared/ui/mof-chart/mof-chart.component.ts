import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import ApexCharts, { ApexOptions } from 'apexcharts';

@Component({
  selector: 'app-mof-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-chart.component.html',
  styleUrl: './mof-chart.component.scss',
})
export class MofChartComponent implements AfterViewInit, OnDestroy {
  readonly options = input.required<ApexOptions>();
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private chart?: ApexCharts;
  private ready = false;

  constructor() {
    effect(() => {
      const next = this.options();
      if (!this.ready) {
        return;
      }
      void this.chart?.updateOptions(next, true, true);
    });
  }

  ngAfterViewInit(): void {
    this.chart = new ApexCharts(this.host().nativeElement, this.options());
    void this.chart.render().then(() => {
      this.ready = true;
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
